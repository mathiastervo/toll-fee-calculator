import { feeConfig } from './config';

const parsedConfig: {
    minutes: number,
    toll: number,
}[] = feeConfig.current.map(({ start, toll }) => {
    const [ hour, minute ] = start.split(':').map(Number);

    return {
        minutes: hour * 60 + minute,
        toll,
    };
});

const lookup = parsedConfig.reduce<number[]>((acc, conf, index, arr) => {
    const next = arr[index + 1];

    const partialLookup: number[] = new Array((next?.minutes ?? 1440) - conf.minutes).fill(conf.toll);

    return [
        ...acc,
        ...partialLookup
    ];
}, []);

export const lookupTollFee = (minute: number) => lookup[minute - 1];
