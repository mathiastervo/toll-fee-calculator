import { Vehicle } from './vehicle';

// @todo Use enum instead - This just feels like an old way to do it.
// @todo Remove '' from keys
const TollFreeVehicles = Object.freeze({
    'MOTORBIKE': 'Motorbike',
    'TRACTOR': 'Tractor',
    'EMERGENCY': 'Emergency',
    'DIPLOMAT': 'Diplomat',
    'FOREIGN': 'Foreign',
    'MILITARY': 'Military'
});

/**
 * Calculate the total toll fee for one day.
 * 
 * @param {Vehicle} vehicle The vehicle.
 * @param {...Date} dates Date and time of all passages on one day.
 * @return {number} The total toll fee for that day.
 */
const getTollFee = (vehicle?: Vehicle, ...dates: any[]): unknown => {
    // @todo No reason for us to require a complicated data structure when we only need to know the type.
    //       I.e. we currently force the consumer to use a class structure when we dont know anything really?
    // @todo Could possibly have an optional logging param to enable logging but put the responsibility on the consumer.
    // @todo Unknown vehicle - to toll or not to toll? Should they be handled manually? How often does it occur?
    // @todo What does vehicle contain? Type should be fine since we dont want to be the once to log sensitive data.
    // @todo Since we dont do anything with the Vehicle - it could be just the type that is passed in?
    // @todo Vehicle should not be nullable, if the consumer dont know the type then there should be an UNKNOWN type.
    // @todo I would prefer not to spread all the rest of the inputs into a list of dates.
    // @todo The input types are bad. Any should be Date and return value should be number.
    // @todo Since we dont need to hold a state and only operate on a set list of dates these do not need to be var.
    var intervalStart = dates[0];
    var totalFee: number | undefined = undefined;

    // @todo Map or reduce over the values - Will probably map and then sum the values.
    // @todo Filter remove dates? Filter throw error if list contain multiple dates?
    // @todo Sure they are "dates" but they should all just be different times of the same date. Anything else is usage error.
    for (const date of dates) {
        // @notice This function sums all passes for each hour.
        var m = Math.floor((date - intervalStart) / (1000 * 60));
        var nextFee = tollFeePassage(date, vehicle);
        var tempFee = tollFeePassage(intervalStart, vehicle);

        // @todo Something feels off, I smell a bugg.
        if (m <= 60) {
            if (totalFee > 0) totalFee -= tempFee;
            if (nextFee >= tempFee) tempFee = nextFee;
            totalFee += tempFee;
        } else {
            totalFee += nextFee;
        }
    }

    if (totalFee > 60) totalFee = 60;
    return totalFee;

    // @todo These functions should be outside of the getTollFee -
    function isTollFreeVehicle(vehicle: any) {
        // @todo Strict check - Can vehicle be unknown?
        if (vehicle == null) return false;

        // @todo let should be const - if left as is
        let vehicleType = vehicle.getType();

        // @todo Check if type is listed in list of free types.
        return vehicleType === TollFreeVehicles.MOTORBIKE ||
               vehicleType === TollFreeVehicles.TRACTOR ||
               vehicleType === TollFreeVehicles.EMERGENCY ||
               vehicleType === TollFreeVehicles.DIPLOMAT ||
               vehicleType === TollFreeVehicles.FOREIGN ||
               vehicleType === TollFreeVehicles.MILITARY;
    }
    
    /**
     * Return the fee for the passage at `date`.
     * 
     * @param {Date} date The passage date.
     * @param {Vehicle} vehicle The vehicle.
     * @return {number} The toll fee for the passage.
     */
    function tollFeePassage(date?: Date, vehicle?: Vehicle) {
        // @todo No var, is this variable even needed? - No
        var h;

        // @todo Separate guard clauses - Semantically toll free vehicle super seeds toll free date.
        if (isTollFreeDate(date) || isTollFreeVehicle(vehicle)) return 0;

        // @todo Destruct value or use cost. I would prefer to use Luxon instead.
        h = date.getHours();
        m = date.getMinutes();

        // @todo Should be configuration - how do we simplify and configure the prices
        // @todo Should be made more readable and verified by product owner

        /*
        * 06:00 - 06:29 = 9
        * 06:30 - 06:59 = 16
        * 07:00 - 07:59 = 22
        * 08:00 - 08:29 = 16
        * 08:30 - 08:59 = 9
        * 09:00 - 09:29 = 0 <- Bugg
        * 09:30 - 09:59 = 9
        * ...
        * 14:00 - 14:29 = 0 <- Bugg
        * 14:30 - 14:59 = 9
        * 15:00 - 15:29 = 16
        * 15:00 - 15:59 = 22 <- Overlap
        * 16:00 - 16:59 = 22
        * 17:00 - 17:59 = 16
        * 18:00 - 18:29 = 9
        * */

        if (h === 6 && m >= 0 && m <= 29) return 9;
        else if (h === 6 && m >= 30 && m <= 59) return 16;
        else if (h === 7 && m >= 0 && m <= 59) return 22;
        else if (h === 8 && m >= 0 && m <= 29) return 16;
        else if (h >= 8 && h <= 14 && m >= 30 && m <= 59) return 9;
        else if (h === 15 && m >= 0 && m <= 29) return 16;
        else if (h === 15 && m >= 0 || h === 16 && m <= 59) return 22;
        else if (h === 17 && m >= 0 && m <= 59) return 16;
        else if (h === 18 && m >= 0 && m <= 29) return 9;
        else return 0;
    }
    
    function isTollFreeDate(date: number | any) {
        // @todo No lets or vars - Should be possible to destruct the values if memory serves.
        let year = date.getYear();
        let month = date.getMonth();
        let day = date.getDate();

        let dayOfWeek = date.getDay();

        // @todo Could perhaps use Sat/Sun names or enum - It would be purely for readability
        if (dayOfWeek === 5 || dayOfWeek === 6) return true;

        // @todo Guard clause for "month === 7"

        // @todo Should be configuration - So these are all holidays huh?
        // @todo Should just be a list of dates
        // @todo Some dates dont change but others vary from year to year
        // @todo Move the month check for July and call it holiday check
        if (year === 2018) {
            if (month === 1 && (day === 1 || day === 5 || day === 6) ||
                month === 3 && (day === 29 || day === 30) ||
                month === 4 && (day === 2 || day === 30) ||
                month === 5 && (day === 1 || day === 9 || day === 10) ||
                month === 6 && (day === 5 || day === 6 || day === 22) ||
                month === 7 ||
                month === 11 && day === 2 ||
                month === 12 && (day === 24 || day === 25 || day === 26 || day === 31)) {
                return true;
            }
        }
    
        return false;
    }
}

export { getTollFee };
