import { describe, it, expect } from 'vitest';
import { getTollFee, jsDateAdapter } from '../src';
import { tollFreeMonth } from '../src/config';


describe('Test toll fee calculations and date handling', () => {
    it('Providing any invalid date will throw error', () => {
        expect(() => getTollFee('Car', jsDateAdapter(
            new Date('2026-4-1T06:15:00'),
            new Date('2026-04-01T07:15:00'),
        )).toThrowError());
    });

    it('Providing multiple different dates will throw error', () => {
        expect(() => getTollFee('Car', jsDateAdapter(
            new Date('2026-04-28T06:15:00'),
            new Date('2026-04-29T06:15:00'),
        )).toThrowError());
    });

    it('Passing within 60 minutes after passing on toll free time should still count', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-28T05:45:10'),
            new Date('2026-04-28T06:15:20'),
            new Date('2026-04-28T18:15:30'),
            new Date('2026-04-28T19:00:40'),
        ));

        expect(fee).toBe(18);
    });

    it('Order of entries should not affect the result', () => {
        const sortedFee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-28T07:14:20'),
            new Date('2026-04-28T06:15:10'),
            new Date('2026-04-28T08:13:30'),
            new Date('2026-04-28T10:11:30'),
            new Date('2026-04-28T09:12:30'),
        ));

        expect(sortedFee).toBe(47);
    });

    it('Frequent traveler should not be charged more than max daily fee', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-28T06:15:10'),
            new Date('2026-04-28T07:45:20'),
            new Date('2026-04-28T15:15:30'),
            new Date('2026-04-28T16:15:30'),
            new Date('2026-04-28T17:15:30'),
        ));

        expect(fee).toBe(60);
    });

    it('Passage exactly 60 minutes later should add to fee', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-28T06:45:00'), // 22 first pass
            new Date('2026-04-28T07:45:00'), // 22 second pass an hour later
            new Date('2026-04-28T08:45:00'), // 9 third pass
            new Date('2026-04-28T09:44:59'), // 0 fourth pass exactly withing one hour of third pass.
        ));

        expect(fee).toBe(22 + 22 + 9 + 0);
    });

    it('Saturday should be toll free', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-25T05:59:59'),
            new Date('2026-04-25T07:15:33'),
            new Date('2026-04-25T10:00:49'),
            new Date('2026-04-25T10:30:15'),
            new Date('2026-04-25T23:15:33'),
        ));

        expect(fee).toBe(0);
    });

    it('Sunday should be toll free', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-26T10:00:49'),
            new Date('2026-04-26T10:30:15'),
            new Date('2026-04-26T07:15:33'),
            new Date('2026-04-26T23:15:33'),
            new Date('2026-04-26T05:59:59'),
        ));
        
        expect(fee).toBe(0);
    });

    it('Holiday should be toll free', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-12-24T10:00:49'),
        ));

        expect(fee).toBe(0);
    });

    it('Passing during toll free moth should be toll free', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date(`2026-0${tollFreeMonth}-08T10:00:49`),
        ));

        expect(fee).toBe(0);
    });

    it('Motorbike should be toll free', () => {
        const fee = getTollFee('Motorbike', jsDateAdapter(
            new Date('2026-12-19T10:00:49'),
        ));

        expect(fee).toBe(0);
    });
});
