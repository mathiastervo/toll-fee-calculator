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

/**
 * Calculate the total toll fee for one day.
 * 
 * @param {VehicleType} vehicleType The vehicle.
 * @param {DateTime[]} dates Date and time of all passages on one day.
 * @return {number} The total toll fee for that day.
 */
export const getTollFee = (vehicleType: VehicleType = 'unknown', dates: DateTime[]): number => {
    // @todo Could possibly have an optional logging param to enable logging but put the responsibility on the consumer.
    // @todo Observe timezone is not configured yet

    // @todo Filter make sure dates are only from within the active period

    if (isTollFreeVehicle(vehicleType)) {
        return 0;
    }

    return dates.reduce<{
        start: DateTime,
        end: DateTime,
        tollFee: number
    }[]>(
        (collectedFees, date) => {
            if (isTollFreeDate(date)) {
                return collectedFees;
            }

            const matchFeeFn = (fee) => Interval.fromDateTimes(fee.start, fee.end).contains(date);

            const existingFee = collectedFees.find(matchFeeFn);

            const rest = collectedFees.filter((fee) => !matchFeeFn(fee));

            const tollFee = Math.max((existingFee?.tollFee ?? 0), lookupTollFee(timeToMinutes(date)));

            if (!tollFee) {
                return rest;
            }

            // Update existing fee
            if (existingFee) {
                return [
                    {
                        ...existingFee,
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
                    end: date.plus({ minutes: feeBundlePeriodMinutes } ), // @todo Verify if 59 or 60
                    tollFee,
                },
            ];
        },
        []
    ).reduce((total, { toll, start }) => {
        // Here we sum the total toll fee
        // If the sum of all any given days total toll fee should be caped at maxDailyFee value
        return Math.min(total + toll, maxDailyFee);
    }, 0);
}
