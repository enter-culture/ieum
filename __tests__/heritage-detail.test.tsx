import { render, screen } from '@testing-library/react'
import HeritageDetailPage from '@/views/heritage-detail/ui/HeritageDetailPage'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

const heritage = heritageList[0]

describe('HeritageDetailPage', () => {
  it('renders heritage name in header', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })
  it('renders category and region', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    expect(screen.getByText(heritage.category)).toBeInTheDocument()
    expect(screen.getByText(heritage.region)).toBeInTheDocument()
  })
  it('renders 뒤로가기 link to explore', () => {
    render(<HeritageDetailPage id={heritage.id} />)
    const link = screen.getByRole('link', { name: /뒤로/ })
    expect(link).toHaveAttribute('href', '/explore')
  })
  it('throws notFound for unknown id', () => {
    expect(() =>
      render(<HeritageDetailPage id="does-not-exist" />)
    ).toThrow('NEXT_NOT_FOUND')
  })
})
