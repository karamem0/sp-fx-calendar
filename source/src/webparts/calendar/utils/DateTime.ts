import * as dateFormat from 'dateformat';

export class DateTime {

  public static today(): DateTime {
    const date = new Date();
    return new DateTime(new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
  }

  public static enumYears(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let date = new Date(beginDate);
    for (let index = 0; ; index++) {
      if (date > endDate) {
        break;
      }
      if (!callback(index, new Date(date))) {
        break;
      }
      date.setFullYear(date.getFullYear() + 1);
    }
  }

  public static enumMonths(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let num = beginDate.getFullYear() * 12 + beginDate.getMonth();
    for (let index = 0; ; index++) {
      const year = Math.floor(num / 12);
      const month = num % 12;
      const date = new Date(year, month + 1, 1);
      date.setDate(0);
      if (date.getDate() > beginDate.getDate()) {
        date.setDate(beginDate.getDate());
      }
      if (date > endDate) {
        break;
      }
      if (!callback(index, new Date(date))) {
        break;
      }
      num++;
    }
  }

  public static enumWeeks(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let date = new Date(beginDate);
    for (let index = 0; ; index++) {
      if (date > endDate) {
        break;
      }
      if (!callback(index, new Date(date))) {
        break;
      }
      date.setDate(date.getDate() + 7);
    }
  }

  public static enumDates(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let date = new Date(beginDate);
    for (let index = 0; ; index++) {
      if (date > endDate) {
        break;
      }
      if (!callback(index, new Date(date))) {
        break;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  public static enumWeekdays(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let date = new Date(beginDate);
    for (let index = 0; ; index++) {
      if (date > endDate) {
        break;
      }
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        if (!callback(index, new Date(date))) {
          break;
        }
      } else {
        index--;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  public static enumWeekendDays(beginDate: Date, endDate: Date, callback: { (index: number, date: Date): boolean }): void {
    let date = new Date(beginDate);
    for (let index = 0; ; index++) {
      if (date > endDate) {
        break;
      }
      if (date.getDay() == 0 || date.getDay() == 6) {
        if (!callback(index, new Date(date))) {
          break;
        }
      } else {
        index--;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  public static diffDates(beginDate: Date, endDate: Date): number {
    return Math.floor((endDate.getTime() - beginDate.getTime()) / 86400000);
  }

  public static getDate(year: number, month: number, day: number): Date {
    let date = new Date(year, month, day);
    if (date.getFullYear() > year || date.getMonth() > month) {
      date = new Date(year, month, 1);
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
    }
    return date;
  }

  public static isWeekday(date: Date): boolean {
    return date.getDay() >= 1 && date.getDay() <= 5;
  }

  private date: Date;

  constructor(value: string | Date) {
    switch (Object.prototype.toString.call(value).slice(8, -1)) {
      case 'String':
        this.date = new Date(Date.parse(value.toString()));
        break;
      case 'Date':
        this.date = new Date(value);
        break;
      case 'Null':
        break;
      default:
        throw new Error();
    }
  }

  public beginOfMonth(): DateTime {
    const date = new Date(this.date);
    date.setDate(1);
    return new DateTime(date);
  }

  public endOfMonth(): DateTime {
    const date = new Date(this.date);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return new DateTime(date);
  }

  public beginOfWeek(): DateTime {
    const date = new Date(this.date);
    date.setDate(date.getDate() - date.getDay());
    return new DateTime(date);
  }

  public endOfWeek(): DateTime {
    const date = new Date(this.date);
    date.setDate(date.getDate() + 6 - date.getDay());
    return new DateTime(date);
  }

  public beginOfDate(): DateTime {
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);
    return new DateTime(date);
  }

  public endOfDate(): DateTime {
    const date = new Date(this.date);
    date.setHours(23, 59, 59, 999);
    return new DateTime(date);
  }

  public nextYear(): DateTime {
    const date = new Date(this.date);
    date.setFullYear(date.getFullYear() + 1);
    return new DateTime(date);
  }

  public prevYear(): DateTime {
    const date = new Date(this.date);
    date.setFullYear(date.getFullYear() - 1);
    return new DateTime(date);
  }

  public nextMonth(): DateTime {
    let year = this.date.getFullYear();
    let month = this.date.getMonth() + 1;
    if (month == 12) {
      year++;
      month = 0;
    }
    let date = new Date(year, month, 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    if (date.getDate() >= this.date.getDate()) {
      date.setDate(this.date.getDate());
    }
    return new DateTime(date);
  }

  public prevMonth(): DateTime {
    let year = this.date.getFullYear();
    let month = this.date.getMonth() - 1;
    if (month == -1) {
      year--;
      month = 11;
    }
    let date = new Date(year, month, 1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    if (date.getDate() >= this.date.getDate()) {
      date.setDate(this.date.getDate());
    }
    return new DateTime(date);
  }

  public nextDay(): DateTime {
    const date = new Date(this.date);
    date.setDate(date.getDate() + 1);
    return new DateTime(date);
  }

  public prevDay(): DateTime {
    const date = new Date(this.date);
    date.setDate(date.getDate() - 1);
    return new DateTime(date);
  }

  public isWeekday(): boolean {
    return this.date.getDay() >= 1 && this.date.getDay() <= 5;
  }

  public format(format: string): string {
    return dateFormat(this.date, format);
  }

  public local(): DateTime {
    return new DateTime(new Date(this.date.getTime() - this.date.getTimezoneOffset() * 60 * 1000));
  }

  public universal(): DateTime {
    return new DateTime(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60 * 1000));
  }

  public setDate(value: Date): DateTime {
    const date = new Date(this.date);
    date.setFullYear(value.getFullYear());
    date.setMonth(value.getMonth());
    date.setDate(value.getDate());
    return new DateTime(date);
  }

  public setTime(value: Date): DateTime {
    const date = new Date(this.date);
    date.setHours(value.getHours());
    date.setMinutes(value.getMinutes());
    date.setSeconds(value.getSeconds());
    return new DateTime(date);
  }

  public toDate(): Date {
    return new Date(this.date);
  }

}
