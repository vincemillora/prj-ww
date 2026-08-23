import { WEDDING_DATE_ISO } from '@/lib/wedding';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const [year, month, day] = WEDDING_DATE_ISO.slice(0, 10)
  .split('-')
  .map(Number);
const firstWeekday = new Date(year, month - 1, 1).getDay();
const daysInMonth = new Date(year, month, 0).getDate();
const monthLabel = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${WEDDING_DATE_ISO.slice(0, 10)}T00:00:00Z`));
const weekdayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  timeZone: 'UTC',
}).format(new Date(`${WEDDING_DATE_ISO.slice(0, 10)}T00:00:00Z`));

const calendarDays: Array<number | null> = [
  ...Array.from({ length: firstWeekday }, () => null),
  ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
];

export function CountdownCalendar() {
  return (
    <div
      aria-label={`Wedding date calendar: ${monthLabel}, ${day}`}
      className="w-full max-w-[19rem] border border-ink p-4 text-ink sm:p-5"
      data-testid="countdown-calendar"
    >
      <div className="mb-4 flex items-end justify-between border-b border-ink pb-3">
        <p className="font-sans text-label font-medium uppercase tracking-[0.12em]">
          {monthLabel}
        </p>
        <p className="font-sans text-micro uppercase tracking-[0.1em]">
          {weekdayLabel} / {day}
        </p>
      </div>

      <table className="w-full table-fixed border-collapse" aria-label={monthLabel}>
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th
                key={weekday}
                scope="col"
                className="pb-2 font-sans text-micro font-medium uppercase tracking-[0.08em]"
              >
                <span aria-hidden>{weekday.slice(0, 1)}</span>
                <span className="sr-only">{weekday}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, week) => (
            <tr key={week}>
              {calendarDays.slice(week * 7, week * 7 + 7).map((date, index) => (
                <td key={`${week}-${index}`} className="py-1 text-center">
                  {date ? (
                    <time
                      dateTime={`${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`}
                      className={
                        date === day
                          ? 'mx-auto flex size-8 items-center justify-center rounded-full bg-ink font-sans text-label font-medium text-paper'
                          : 'font-sans text-label'
                      }
                    >
                      {date}
                    </time>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
