import { toBbox, fetchEventsForCenters } from '@/shared/api/culture';

describe('toBbox', () => {
  it('pads center by default 0.05', () => {
    expect(toBbox({ lat: 36.5, lng: 128.5 })).toEqual({
      xfrom: 128.45, yfrom: 36.45, xto: 128.55, yto: 36.55,
    });
  });
});

describe('fetchEventsForCenters', () => {
  const ev = (id: string) => ({
    id, kind: '공연', title: 't' + id, genre: '', place: '', area: '',
    sigungu: '', startDate: '', endDate: '', thumbnail: null, lat: 1, lng: 1,
  });

  it('merges results and dedups by id, tolerating a failed center', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([ev('1'), ev('2')]) })
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([ev('2'), ev('3')]) }) as unknown as typeof fetch;

    const out = await fetchEventsForCenters(
      [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 3 }],
      '20260601', '20260831',
    );
    expect(out.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
  });
});
