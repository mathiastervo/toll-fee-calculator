
export enum TollFreeVehicles {
    MOTORBIKE = 'Motorbike',
    TRACTOR = 'Tractor',
    EMERGENCY = 'Emergency',
    DIPLOMAT = 'Diplomat',
    FOREIGN = 'Foreign',
    MILITARY = 'Military'
}

export type VehicleType = string | 'Car' | TollFreeVehicles;
