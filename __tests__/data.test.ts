import { heritageList } from '@/entities/heritage/data/heritageList'
import type { Heritage } from '@/entities/heritage/model/heritage'

describe('heritageList', () => {
  it('has at least one item', () => {
    expect(heritageList.length).toBeGreaterThan(0)
  })
  it('every item has required fields', () => {
    heritageList.forEach((item: Heritage) => {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.videoSrc).toBeTruthy()
      expect(typeof item.likes).toBe('number')
    })
  })
  it('every id is unique', () => {
    const ids = heritageList.map((h: Heritage) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
