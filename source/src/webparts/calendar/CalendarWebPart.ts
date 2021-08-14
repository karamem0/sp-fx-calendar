import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
import { initializeIcons } from '@fluentui/react';

import * as strings from 'CalendarWebPartStrings';

import {
  ICalendarProps,
  Calendar
} from './components/Calendar';
import { CalendarService } from './services/CalendarService';
import { TeamsDarkTheme } from './styles/TeamsDarkTheme';
import { TeamsDefaultTheme } from './styles/TeamsDefaultTheme';

export interface ICalendarWebPartProps {
  listId: string;
}

export default class CalendarWebPart extends BaseClientSideWebPart<ICalendarWebPartProps> {

  private listNameDropdownOptions: IPropertyPaneDropdownOption[];
  private listNameDropdownDisabled: boolean = true;

  public render(): void {
    initializeIcons();
    const element: React.ReactElement<ICalendarProps> = React.createElement(
      Calendar,
      {
        service: new CalendarService(this.context, this.properties.listId),
        theme: (() => {
          if (this.context.sdks.microsoftTeams) {
            if (this.context.sdks.microsoftTeams.context.theme == 'default') {
              return TeamsDefaultTheme;
            }
            if (this.context.sdks.microsoftTeams.context.theme == 'dark') {
              return TeamsDarkTheme;
            }
          }
          return null;
        })()
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected async onPropertyPaneConfigurationStart(): Promise<void> {
    if (this.listNameDropdownOptions) {
      return;
    }
    const response = await this.context.spHttpClient
      .get(
        this.context.pageContext.web.serverRelativeUrl +
        `/_api/web/lists?$filter=BaseTemplate eq 106`,
        SPHttpClient.configurations.v1);
    const data = await response.json();
    if (data.error) {
      throw data.error;
    }
    this.listNameDropdownDisabled = false;
    this.listNameDropdownOptions = data.value.map((item: any) => {
      return {
        key: item.Id,
        text: item.Title
      };
    });
    this.context.propertyPane.refresh();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.6.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupFields: [
                PropertyPaneDropdown('listId', {
                  label: strings.ListNameLabel,
                  options: this.listNameDropdownOptions,
                  disabled: this.listNameDropdownDisabled
                })
              ]
            }
          ]
        }
      ]
    };
  }

}
