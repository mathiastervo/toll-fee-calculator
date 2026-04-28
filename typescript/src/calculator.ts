import { VehicleType, TollFreeVehicles } from './vehicle';
import { DateTime, Interval } from 'luxon';
import { lookupTollFee } from './lookup';
import {
    feeBundlePeriodMinutes,
    holidayConfig,
    maxDailyFee,
    tollFreeMonth,
    tollFreeWeekDays
} from './config';

type JsDateAdapterFn = (...dates: Date[]) => DateTime[];

// This might be complicating it a little bit, but I really want to use Luxon
export const jsDateAdapter: JsDateAdapterFn = (...dates) => (
    dates.map((date) => DateTime.fromJSDate(date))
);

const isTollFreeVehicle = (vehicleType: VehicleType) =>
    Object.values(TollFreeVehicles).includes(vehicleType);

const isHoliday = (date:DateTime) => holidayConfig.includes(date.toFormat('yyyy-MM-dd'));

const isTollFreeDate = (date: DateTime) => {
    if (tollFreeWeekDays.includes(date.weekday)) {
        return true;
    }

    if (tollFreeMonth.includes(date.month)) {
        return true;
    }

    return isHoliday(date);
}

const timeToMinutes = (date: DateTime) => date.hour * 60 + date.minute;

const matchFeeFn = (date: DateTime) => (fee) => Interval.fromDateTimes(fee.start, fee.end).contains(date);

const validateDates = (dates: DateTime[]) => {
    const [first] = dates;

    return dates.map((date) => {
        if (!date.isValid) {
            throw Error('Invalid date provided');
        }

        if (!date.hasSame(first, 'day')) {
            throw Error('All dates must be the same year and day');
        }
    });
}

/**
 * Calculate the total toll fee for one day.
 * 
 * @param {VehicleType} vehicleType The vehicle.
 * @param {DateTime[]} dates Date and time of all passages on one day.
 * @return {number} The total toll fee for that day.
 */
export const getTollFee = (vehicleType: VehicleType = 'unknown', dates: DateTime[]): number => {
    dates.sort();

    validateDates(dates);

    if (isTollFreeVehicle(vehicleType)) {
        return 0;
    }

    return dates.reduce<{
        start: DateTime,
        end: DateTime,
        tollFee: number
    }[]>(
        (collectedTollFees, date) => {
            if (isTollFreeDate(date)) {
                return collectedTollFees;
            }

            const existingTollFee = collectedTollFees.find(matchFeeFn(date));

            const rest = collectedTollFees.filter((fee) => !matchFeeFn(date)(fee));

            const tollFee = Math.max((existingTollFee?.tollFee ?? 0), lookupTollFee(timeToMinutes(date)));

            if (!tollFee) {
                return rest;
            }

            // Update existing fee
            if (existingTollFee) {
                return [
                    {
                        ...existingTollFee,
                        tollFee,
                    },
                    ...rest,
                ];
            }

            // Create new fee
            return [
                ...rest,
                {
                    start: date,
                    end: date.plus({ minutes: feeBundlePeriodMinutes } ),
                    tollFee,
                },
            ];
        },
        []
    ).reduce((totalTollFee, { tollFee}) => {
        // Here we sum the total toll fee
        // If the sum of all any given days total toll fee should be caped at maxDailyFee value
        return Math.min(totalTollFee + tollFee, maxDailyFee);
    }, 0);
}
