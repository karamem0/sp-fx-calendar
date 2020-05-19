import * as React from 'react';
import styles from './Calendar.module.scss';
import * as Office from 'office-ui-fabric-react';

import * as strings from 'CalendarWebPartStrings';

import {
  ICalendarWeekProps,
  CalendarWeek
} from './CalendarWeek';
import { CalendarPanelView } from './CalendarPanelView';
import { CalendarPanelAdd } from './CalendarPanelAdd';
import { IPermissionInformation } from './IPermissionInformation';
import { EventItem } from '../models/EventItem';
import { PermissionKind } from '../models/Permission';
import { CalendarService } from '../services/CalendarService';
import { DateTime } from '../utils/DateTime';

export interface ICalendarProps {
  service: CalendarService;
}

export interface ICalendarState {
  date: Date;
  permission: IPermissionInformation;
  items: Array<EventItem>;
  itemView: EventItem;
  itemAdd: EventItem;
  isCalloutVisible: boolean;
  error: string;
}

export class Calendar extends React.Component<ICalendarProps, ICalendarState> {

  private dateButton: HTMLElement;
  private calloutLabelId: string = Office.getId('callout-label');
  private calloutDescriptionId: string = Office.getId('callout-description');

  constructor(props: ICalendarProps) {
    super(props);
    this.state = {
      date: DateTime.today().toDate(),
      permission: {
        canAdd: false,
        canEdit: false,
        canDelete: false,
      },
      items: [],
      itemView: null,
      itemAdd: null,
      isCalloutVisible: false,
      error: null
    };
  }

  public render(): React.ReactElement<ICalendarProps> {
    const beginDate = new DateTime(this.state.date).beginOfMonth().beginOfWeek().toDate();
    const endDate = new DateTime(this.state.date).endOfMonth().endOfWeek().toDate();
    const weekProps = new Array<ICalendarWeekProps>();
    for (let date = new Date(beginDate); date < endDate; date.setDate(date.getDate() + 7)) {
      weekProps.push({
        beginDate: new Date(date),
        endDate: new DateTime(date).endOfWeek().toDate(),
        permission: this.state.permission,
        items: this.state.items.filter((event) =>
          event.beginDate >= date &&
          event.beginDate < new DateTime(date).endOfWeek().nextDay().toDate()
        ),
        onItemAdd: (item: EventItem) => this.setState({ itemAdd: item }),
        onItemSelect: (item) => this.setState({ itemView: item })
      });
    }
    return (
      <div className={styles.calendar}>
        {
          this.state.error
            ? <Office.MessageBar
                messageBarType={Office.MessageBarType.error}
                onDismiss={() => this.setState({ error: null })}>
                  {this.state.error}
              </Office.MessageBar>
            : null
        }
        <table>
          <thead>
            <tr>
              <td colSpan={7} className={styles.head}>
                <Office.IconButton
                  className={styles.icon}
                  iconProps={{ iconName: 'ChevronLeft' }}
                  onClick={this.onPrevMonth.bind(this)} />
                <span ref={(element) => this.dateButton = element}>
                  <Office.ActionButton
                    className={styles.date}
                    onClick={() => this.setState({ isCalloutVisible: true })}>
                    {new DateTime(this.state.date).format(strings.YearMonthFormat)}
                  </Office.ActionButton>
                </span>
                <Office.IconButton
                  className={styles.icon}
                  iconProps={{ iconName: 'ChevronRight' }}
                  onClick={this.onNextMonth.bind(this)} />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.head}>
              {
                strings.DayNames.map((name) => 
                  <td className={styles.calendarhead}>
                    {name}
                  </td>
                )
              }
            </tr>
            {
              weekProps.map((props) =>
                <CalendarWeek key={new DateTime(props.beginDate).format('yyyymmdd')} {...props} />
              )
            }
          </tbody>
        </table>
        {
          this.state.isCalloutVisible
            ? <Office.Callout
                className={styles.callout}
                target={this.dateButton}
                ariaLabelledBy={this.calloutLabelId}
                ariaDescribedBy={this.calloutDescriptionId}
                onDismiss={() => this.setState({ isCalloutVisible: false })}>
                <div id={this.calloutLabelId} className={styles.label}>
                  <Office.IconButton
                    iconProps={{ iconName: 'ChevronLeft' }}
                    onClick={this.onPrevYear.bind(this)} />
                  {this.state.date.getFullYear()}
                  <Office.IconButton
                    iconProps={{ iconName: 'ChevronRight' }}
                    onClick={this.onNextYear.bind(this)} />
                </div>
                <div id={this.calloutDescriptionId} className={styles.description}>
                  {
                    strings.MonthShortNames.map((value, index) => 
                      <Office.ActionButton
                        className={styles.button}
                        onClick={this.onSetMonth.bind(this, index)}>
                        {value}
                      </Office.ActionButton>
                    )
                  }
                </div>
              </Office.Callout>
            : null
        }
        <CalendarPanelView
          item={this.state.itemView}
          onDelete={(value) => this.onItemDelete(value)}
          onCancel={() => this.setState({ itemView: null })} />
        <CalendarPanelAdd
          item={this.state.itemAdd}
          onSave={(value) => this.onItemAdd(value)}
          onCancel={() => this.setState({ itemAdd: null })} />
      </div>
    );
  }

  public async componentDidMount(): Promise<void> {
    try {
      const items = await this.props.service.getItems(this.state.date);
      const perm = await this.props.service.getBasePermission();
      this.setState({
        items: items,
        permission: {
          canAdd: perm.has(PermissionKind.AddListItems),
          canEdit: perm.has(PermissionKind.EditListItems),
          canDelete: perm.has(PermissionKind.DeleteListItems)
        },
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  public async componentDidUpdate(prevProps: ICalendarProps, prevState: ICalendarState): Promise<void> {
    if (this.props.service.listId == prevProps.service.listId) {
      return;
    }
    try {
      const items = await this.props.service.getItems(this.state.date);
      const perm = await this.props.service.getBasePermission();
      this.setState({
        items: items,
        permission: {
          canAdd: perm.has(PermissionKind.AddListItems),
          canEdit: perm.has(PermissionKind.EditListItems),
          canDelete: perm.has(PermissionKind.DeleteListItems)
        },
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  private async onPrevMonth(): Promise<void> {
    try {
      const date = new DateTime(this.state.date).prevMonth().toDate();
      const items = await this.props.service.getItems(date);
      this.setState({
        date: date,
        items: items,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  private async onNextMonth(): Promise<void> {
    try {
      const date = new DateTime(this.state.date).nextMonth().toDate();
      const items = await this.props.service.getItems(date);
      this.setState({
        date: date,
        items: items,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  private async onSetMonth(month: number): Promise<void> {
    try {
      const date = new Date(this.state.date);
      date.setMonth(month);
      const items = await this.props.service.getItems(date);
      this.setState({
        date: date,
        items: items,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  private async onPrevYear(): Promise<void> {
    try {
      const date = new DateTime(this.state.date).prevYear().toDate();
      const items = await this.props.service.getItems(date);
      this.setState({
        date: date,
        items: items,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  private async onNextYear(): Promise<void> {
    try {
      const date = new DateTime(this.state.date).nextYear().toDate();
      const items = await this.props.service.getItems(date);
      this.setState({
        date: date,
        items: items,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  public async onItemAdd(item: EventItem): Promise<void> {
    try {
      await this.props.service.createItem(item);
      const items = await this.props.service.getItems(this.state.date);
      this.setState({
        items: items,
        itemAdd: null,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

  public async onItemDelete(item: EventItem): Promise<void> {
    try {
      await this.props.service.deleteItem(item);
      const items = await this.props.service.getItems(this.state.date);
      this.setState({
        items: items,
        itemView: null,
        error: null
      });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
  }

}
