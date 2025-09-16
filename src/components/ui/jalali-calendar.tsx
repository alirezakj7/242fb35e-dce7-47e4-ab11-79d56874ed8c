import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { JalaliCalendar } from "@/utils/jalali";
import moment from 'moment-jalaali';

interface JalaliCalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

export function JalaliCalendarComponent({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
  initialFocus,
}: JalaliCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selected ? moment(selected) : moment();
  });

  const monthStart = JalaliCalendar.startOfMonth(currentMonth.toDate());
  const monthEnd = JalaliCalendar.endOfMonth(currentMonth.toDate());
  
  // Get the first day of the week for this month
  const startWeek = JalaliCalendar.startOfWeek(monthStart.toDate());
  const endWeek = JalaliCalendar.endOfWeek(monthEnd.toDate());
  
  const days = [];
  let day = moment(startWeek.toDate());
  
  while (day.isSameOrBefore(endWeek, 'day')) {
    days.push(day.clone());
    day.add(1, 'day');
  }

  const weekDays = JalaliCalendar.getWeekDays();
  const monthNames = JalaliCalendar.getMonthNames();

  const handlePrevious = () => {
    setCurrentMonth(prev => prev.clone().subtract(1, 'jMonth'));
  };

  const handleNext = () => {
    setCurrentMonth(prev => prev.clone().add(1, 'jMonth'));
  };

  const handleDayClick = (date: moment.Moment) => {
    if (disabled && disabled(date.toDate())) return;
    onSelect?.(date.toDate());
  };

  const isSelected = (date: moment.Moment) => {
    return selected && moment(selected).isSame(date, 'day');
  };

  const isToday = (date: moment.Moment) => {
    return JalaliCalendar.isToday(date.toDate());
  };

  const isCurrentMonth = (date: moment.Moment) => {
    return JalaliCalendar.isSameMonth(date.toDate(), currentMonth.toDate());
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-center pt-1 relative items-center">
          <Button
            variant="outline"
            size="sm"
            className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {monthNames[currentMonth.jMonth()]} {JalaliCalendar.toPersianDigits(currentMonth.jYear().toString())}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="flex">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex w-full">
              {week.map((day, dayIndex) => {
                const isDisabled = disabled && disabled(day.toDate());
                const isDaySelected = isSelected(day);
                const isDayToday = isToday(day);
                const isInCurrentMonth = isCurrentMonth(day);

                return (
                  <div key={dayIndex} className="h-9 w-9 text-center text-sm p-0 relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-9 w-9 p-0 font-normal",
                        isDaySelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        isDayToday && !isDaySelected && "bg-accent text-accent-foreground",
                        !isInCurrentMonth && "text-muted-foreground opacity-50",
                        isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isDisabled && handleDayClick(day)}
                      disabled={isDisabled}
                    >
                      {JalaliCalendar.toPersianDigits(day.format('jD'))}
                    </Button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}