import { Settings } from 'luxon';

Settings.defaultZone = process.env.TZ || 'Europe/Stockholm';
Settings.defaultLocale = process.env.LOCALE || 'sv-SE';

export const feeConfig: {
    current: {
        start: string,
        end: string,
        toll: number,
    }[],
} = {
    current: [
        { start: '00:00', end: '05:59', toll: 0 },
        { start: '06:00', end: '06:29', toll: 9 },
        { start: '06:30', end: '06:59', toll: 22 },
        { start: '07:00', end: '07:59', toll: 22 },
        { start: '08:00', end: '08:29', toll: 16 },
        { start: '08:30', end: '14:59', toll: 9 },
        { start: '15:00', end: '15:29', toll: 16 },
        { start: '15:30', end: '16:59', toll: 22 },
        { start: '17:00', end: '17:59', toll: 16 },
        { start: '18:00', end: '18:29', toll: 9 },
        { start: '18:30', end: '23:59', toll: 0 },
    ]
};

export const maxDailyFee = 60;

// Use the highest fee value from within this many minutes
export const feeBundlePeriodMinutes = 60;

export const holidayConfig: string[] = [
    '2026-01-01',
    '2026-01-05',
    '2026-01-06',
    '2026-04-02',
    '2026-04-03',
    '2026-04-06',
    '2026-04-30',
    '2026-05-01',
    '2026-05-13',
    '2026-05-14',
    '2026-06-05',
    '2026-06-19',
    '2026-10-30',
    '2026-12-24',
    '2026-12-25',
    '2026-12-31',
];

enum Weekday {
    Monday = 1,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

export const tollFreeWeekDays = [
    Weekday.Saturday,
    Weekday.Sunday,
];

enum Month {
    July = 7,
}

export const tollFreeMonth = [
    Month.July
];
