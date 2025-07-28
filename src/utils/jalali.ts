import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

export class JalaliCalendar {
  static now(): moment.Moment {
    return moment();
  }

  static format(date: Date | moment.Moment | string, format: string = 'jYYYY/jMM/jDD'): string {
    return moment(date).format(format);
  }

  static formatPersian(date: Date | moment.Moment | string, format: string = 'jDD jMMMM jYYYY'): string {
    return moment(date).format(format);
  }

  static startOfMonth(date?: Date | moment.Moment): moment.Moment {
    return moment(date).startOf('jMonth');
  }

  static endOfMonth(date?: Date | moment.Moment): moment.Moment {
    return moment(date).endOf('jMonth');
  }

  static startOfWeek(date?: Date | moment.Moment): moment.Moment {
    return moment(date).startOf('week');
  }

  static endOfWeek(date?: Date | moment.Moment): moment.Moment {
    return moment(date).endOf('week');
  }

  static addDays(date: Date | moment.Moment, days: number): moment.Moment {
    return moment(date).add(days, 'days');
  }

  static addMonths(date: Date | moment.Moment, months: number): moment.Moment {
    return moment(date).add(months, 'jMonth');
  }

  static getDaysInMonth(date?: Date | moment.Moment): number {
    const m = moment(date);
    return parseInt(m.format('jD'));
  }

  static getWeekDays(): string[] {
    return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  }

  static getMonthNames(): string[] {
    return [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
  }

  static isToday(date: Date | moment.Moment): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  static isSameMonth(date1: Date | moment.Moment, date2: Date | moment.Moment): boolean {
    return moment(date1).format('jYYYY/jMM') === moment(date2).format('jYYYY/jMM');
  }

  static toPersianDigits(text: string | number): string {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return text.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
  }

  static toEnglishDigits(text: string): string {
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    let result = text;
    persianDigits.forEach((persian, index) => {
      result = result.replace(new RegExp(persian, 'g'), englishDigits[index]);
    });
    
    return result;
  }
}