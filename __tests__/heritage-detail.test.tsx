import { render, screen } from '@testing-library/react'
import HeritagePage from '@/app/heritage/[id]/page'
import { heritageList } from '@/data/heritage'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

const heritage = heritageList[0]

describe('HeritagePage', () => {
  it('renders heritage name in header', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })

  it('renders category and region', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    expect(screen.getByText(heritage.category)).toBeInTheDocument()
    expect(screen.getByText(heritage.region)).toBeInTheDocument()
  })

  it('renders 뒤로가기 link to home', () => {
    render(<HeritagePage params={{ id: heritage.id }} />)
    const link = screen.getByRole('link', { name: /뒤로/ })
    expect(link).toHaveAttribute('href', '/explore')
  })

  it('throws notFound for unknown id', () => {
    expect(() =>
      render(<HeritagePage params={{ id: 'does-not-exist' }} />)
    ).toThrow('NEXT_NOT_FOUND')
  })
})
