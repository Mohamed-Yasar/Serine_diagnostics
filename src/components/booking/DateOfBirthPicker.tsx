import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface DateOfBirthPickerProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

type PickerView = 'calendar' | 'years';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = [
  'Su',
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
];

const pad = (value: number) =>
  String(value).padStart(2, '0');

const formatDateValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
};

const parseDateValue = (value: string) => {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(
    year,
    month,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const isSameDate = (
  first: Date,
  second: Date
) => {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
};

const isFutureDate = (
  date: Date,
  today: Date
) => {
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return dateOnly > todayOnly;
};

export const DateOfBirthPicker: React.FC<
  DateOfBirthPickerProps
> = ({
  value,
  onChange,
  hasError = false,
}) => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const today = useMemo(
    () => new Date(),
    []
  );

  const selectedDate = useMemo(
    () => parseDateValue(value),
    [value]
  );

  const [isOpen, setIsOpen] =
    useState(false);

  const [pickerView, setPickerView] =
    useState<PickerView>('calendar');

  const [visibleMonth, setVisibleMonth] =
    useState(() => {
      const initialDate =
        selectedDate ?? today;

      return new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        1
      );
    });

  const [yearPageStart, setYearPageStart] =
    useState(() => {
      const initialYear =
        selectedDate?.getFullYear() ??
        today.getFullYear();

      return (
        Math.floor(initialYear / 12) * 12
      );
    });

  /*
   * Close when clicking outside
   * or pressing Escape.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
        setPickerView('calendar');
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setPickerView('calendar');
      }
    };

    document.addEventListener(
      'mousedown',
      handlePointerDown
    );

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen]);

  /*
   * Sync picker position with
   * the selected DOB.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (selectedDate) {
      setVisibleMonth(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
      );

      setYearPageStart(
        Math.floor(
          selectedDate.getFullYear() / 12
        ) * 12
      );
    }
  }, [isOpen, selectedDate]);

  /*
   * Build the 6-week calendar grid.
   */
  const calendarDays = useMemo(() => {
    const year =
      visibleMonth.getFullYear();

    const month =
      visibleMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const daysInPreviousMonth =
      new Date(
        year,
        month,
        0
      ).getDate();

    const cells: Array<{
      date: Date;
      currentMonth: boolean;
    }> = [];

    for (
      let index = firstDay - 1;
      index >= 0;
      index--
    ) {
      cells.push({
        date: new Date(
          year,
          month - 1,
          daysInPreviousMonth - index
        ),
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push({
        date: new Date(
          year,
          month,
          day
        ),
        currentMonth: true,
      });
    }

    let nextMonthDay = 1;

    while (cells.length < 42) {
      cells.push({
        date: new Date(
          year,
          month + 1,
          nextMonthDay
        ),
        currentMonth: false,
      });

      nextMonthDay++;
    }

    return cells;
  }, [visibleMonth]);

  /*
   * Display twelve years at a time.
   */
  const yearOptions = useMemo(() => {
    return Array.from(
      { length: 12 },
      (_, index) =>
        yearPageStart + index
    );
  }, [yearPageStart]);

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString(
        'en-US',
        {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }
      )
    : '';

  /*
   * Select a DOB.
   *
   * Future dates are rejected even if
   * a click somehow reaches this handler.
   */
  const handleSelectDate = (
    date: Date
  ) => {
    if (isFutureDate(date, today)) {
      return;
    }

    onChange(formatDateValue(date));

    setIsOpen(false);
    setPickerView('calendar');
  };

  /*
   * Select a year.
   *
   * Future years are rejected.
   */
  const handleSelectYear = (
    year: number
  ) => {
    if (year > today.getFullYear()) {
      return;
    }

    const month =
      visibleMonth.getMonth();

    /*
     * If the selected year is the
     * current year but the currently
     * visible month is in the future,
     * move back to the current month.
     */
    const currentYear =
      today.getFullYear();

    const currentMonth =
      today.getMonth();

    const safeMonth =
      year === currentYear &&
      month > currentMonth
        ? currentMonth
        : month;

    setVisibleMonth(
      new Date(
        year,
        safeMonth,
        1
      )
    );

    setPickerView('calendar');
  };

  /*
   * Previous month.
   */
  const handlePreviousMonth = () => {
    setVisibleMonth(
      previous =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  /*
   * Next month.
   *
   * Never move beyond the current
   * calendar month.
   */
  const handleNextMonth = () => {
    setVisibleMonth(previous => {
      const nextMonth =
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        );

      const currentMonth =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

      if (nextMonth > currentMonth) {
        return previous;
      }

      return nextMonth;
    });
  };

  /*
   * Previous group of twelve years.
   */
  const handlePreviousYearPage = () => {
    setYearPageStart(
      previous => previous - 12
    );
  };

  /*
   * Next group of twelve years.
   *
   * Don't move to a group that contains
   * only future years.
   */
  const handleNextYearPage = () => {
    const nextStart =
      yearPageStart + 12;

    if (nextStart > today.getFullYear()) {
      return;
    }

    setYearPageStart(nextStart);
  };

  /*
   * Select today.
   */
  const handleToday = () => {
    handleSelectDate(today);
  };

  /*
   * Clear DOB.
   */
  const handleClear = () => {
    onChange('');

    setIsOpen(false);
    setPickerView('calendar');
  };

  const currentMonthIsToday =
    visibleMonth.getFullYear() ===
      today.getFullYear() &&
    visibleMonth.getMonth() ===
      today.getMonth();

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* DOB Input */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(
            previous => !previous
          );

          setPickerView('calendar');
        }}
        className={`w-full min-h-[46px] px-3 py-3 bg-[#f8fbfb] border rounded-xl text-xs text-left outline-none transition-all flex items-center justify-between gap-3 ${
          hasError
            ? 'border-red-400 bg-red-50'
            : 'border-[#d6e4e6] hover:border-[#168d90] focus:border-[#168d90]'
        }`}
      >
        <span
          className={
            displayValue
              ? 'text-[#103d4a]'
              : 'text-slate-400'
          }
        >
          {displayValue ||
            'mm/dd/yyyy'}
        </span>

        <Calendar
          size={16}
          strokeWidth={1.8}
          className="text-[#168d90] shrink-0"
        />
      </button>

      {/* Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-[#d6e4e6] bg-white shadow-[0_12px_35px_rgba(16,61,74,0.15)] overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#e5eeee]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (
                    pickerView ===
                    'years'
                  ) {
                    setPickerView(
                      'calendar'
                    );

                    return;
                  }

                  setPickerView('years');

                  setYearPageStart(
                    Math.floor(
                      visibleMonth.getFullYear() /
                        12
                    ) * 12
                  );
                }}
                className="flex items-center gap-1.5 text-sm font-bold text-[#103d4a] hover:text-[#168d90] transition-colors"
              >
                {pickerView ===
                'calendar'
                  ? `${MONTHS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`
                  : 'Select year'}

                <ChevronDown
                  size={15}
                  className="text-[#168d90]"
                />
              </button>

              {/* Calendar navigation */}
              {pickerView ===
                'calendar' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={
                      handlePreviousMonth
                    }
                    aria-label="Previous month"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-[#294c57] hover:bg-[#eef8f8] hover:text-[#168d90] transition-colors"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextMonth
                    }
                    disabled={
                      currentMonthIsToday
                    }
                    aria-label="Next month"
                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                      currentMonthIsToday
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-[#294c57] hover:bg-[#eef8f8] hover:text-[#168d90]'
                    }`}
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>
                </div>
              )}

              {/* Year navigation */}
              {pickerView ===
                'years' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={
                      handlePreviousYearPage
                    }
                    aria-label="Previous years"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-[#294c57] hover:bg-[#eef8f8] hover:text-[#168d90] transition-colors"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextYearPage
                    }
                    disabled={
                      yearPageStart + 12 >
                      today.getFullYear()
                    }
                    aria-label="Next years"
                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                      yearPageStart + 12 >
                      today.getFullYear()
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-[#294c57] hover:bg-[#eef8f8] hover:text-[#168d90]'
                    }`}
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {pickerView ===
          'calendar' ? (
            <>
              {/* Weekdays */}
              <div className="grid grid-cols-7 px-3 pt-3">
                {WEEKDAYS.map(
                  weekday => (
                    <div
                      key={weekday}
                      className="h-8 flex items-center justify-center text-[10px] font-bold text-[#6b858c]"
                    >
                      {weekday}
                    </div>
                  )
                )}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
                {calendarDays.map(
                  ({
                    date,
                    currentMonth,
                  }) => {
                    const selected =
                      selectedDate &&
                      isSameDate(
                        date,
                        selectedDate
                      );

                    const isToday =
                      isSameDate(
                        date,
                        today
                      );

                    const future =
                      isFutureDate(
                        date,
                        today
                      );

                    return (
                      <button
                        type="button"
                        key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                        onClick={() => {
                          if (!future) {
                            handleSelectDate(
                              date
                            );
                          }
                        }}
                        disabled={future}
                        className={`relative h-9 w-full rounded-lg text-xs font-medium transition-all ${
                          future
                            ? 'text-slate-300 cursor-not-allowed'
                            : selected
                              ? 'bg-[#168d90] text-white shadow-sm'
                              : currentMonth
                                ? 'text-[#294c57] hover:bg-[#eef8f8] hover:text-[#103d4a]'
                                : 'text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {date.getDate()}

                        {isToday &&
                          !selected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#168d90]" />
                          )}
                      </button>
                    );
                  }
                )}
              </div>
            </>
          ) : (
            /* Year Selection */
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {yearOptions.map(
                  year => {
                    const selected =
                      selectedDate?.getFullYear() ===
                      year;

                    const currentYear =
                      today.getFullYear() ===
                      year;

                    const futureYear =
                      year >
                      today.getFullYear();

                    return (
                      <button
                        type="button"
                        key={year}
                        onClick={() => {
                          if (
                            !futureYear
                          ) {
                            handleSelectYear(
                              year
                            );
                          }
                        }}
                        disabled={
                          futureYear
                        }
                        className={`h-10 rounded-xl text-xs font-semibold transition-all ${
                          futureYear
                            ? 'text-slate-300 cursor-not-allowed'
                            : selected
                              ? 'bg-[#168d90] text-white'
                              : currentYear
                                ? 'border border-[#168d90] text-[#168d90] bg-[#eef8f8]'
                                : 'text-[#294c57] hover:bg-[#eef8f8] hover:text-[#103d4a]'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-3 text-[10px] text-center text-slate-400">
                Future years are not available
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5eeee] bg-[#fbfdfd]">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={13} />
              Clear
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-bold text-[#168d90] hover:text-[#103d4a] transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};