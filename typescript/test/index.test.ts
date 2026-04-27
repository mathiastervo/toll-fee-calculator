import { describe, it, expect } from 'vitest';
import { getTollFee } from '../src';
import { jsDateAdapter } from '../src/calculator';


describe('Verify lookup generation', () => {
    it('Frequent traveler should not be charged more than max daily fee', () => {

    });

    it('Saturday should be toll free', () => {
        const fee = getTollFee('Car', jsDateAdapter(
            new Date('2026-04-25T10:00:49'),
            new Date('2026-04-25T10:30:15'),
            new Date('2026-04-25T07:15:33'),
            new Date('2026-04-25T23:15:33'),
            new Date('2026-04-25T05:59:59'),
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

    it('Motorbike should be toll free', () => {
        const fee = getTollFee('Motorbike', jsDateAdapter(
            new Date('2026-12-19T10:00:49'),
        ));

        expect(fee).toBe(0);
    });
});
