import { formatCaptionDate, selectableYearCount, toLocalIsoDate } from './date-picker';

describe('formatCaptionDate', () => {
  it('prints a selected date in Polish', () => {
    expect(formatCaptionDate('2026-09-12')).toBe('12 września 2026');
    expect(formatCaptionDate('1999-01-03')).toBe('3 stycznia 1999');
  });

  it('prints nothing when no date is selected', () => {
    expect(formatCaptionDate('')).toBe('');
    expect(formatCaptionDate('2026-02-31')).toBe('');
  });
});

describe('selectable range', () => {
  it('uses the local calendar date as the latest day', () => {
    expect(toLocalIsoDate(new Date(2026, 8, 24))).toBe('2026-09-24');
  });

  it('keeps every year from 2017 through the current year in the menu', () => {
    expect(selectableYearCount(2026)).toBe(19);
    expect(selectableYearCount(2027)).toBe(21);
  });
});
