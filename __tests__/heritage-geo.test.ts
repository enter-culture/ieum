import { resolveHeritageCoord } from '@/shared/lib/heritage-geo';

describe('resolveHeritageCoord', () => {
  it('returns coords for a known heritageId', () => {
    expect(resolveHeritageCoord('taekkyeon')).toEqual({ lat: 36.9910, lng: 127.9259 });
  });
  it('returns null for unknown id', () => {
    expect(resolveHeritageCoord('nope')).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(resolveHeritageCoord(undefined)).toBeNull();
  });
});
