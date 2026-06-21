import { filterByKind } from '@/widgets/recommend-map/lib/filter';

const ev = (kind: string) => ({
  id: kind, kind, title: '', genre: '', place: '', area: '',
  sigungu: '', startDate: '', endDate: '', thumbnail: null, lat: 0, lng: 0,
});

it('returns all when kind is empty', () => {
  const list = [ev('공연'), ev('전시')];
  expect(filterByKind(list, '')).toHaveLength(2);
});
it('filters by kind', () => {
  const list = [ev('공연'), ev('전시')];
  expect(filterByKind(list, '전시').map((e) => e.kind)).toEqual(['전시']);
});
