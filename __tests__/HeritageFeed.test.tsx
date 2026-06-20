import { render, screen } from '@testing-library/react'
import HeritageFeed from '@/widgets/shorts-swiper/ui/HeritageFeed'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('@/widgets/shorts-swiper/ui/HeritageCard', () => ({ heritage }: { heritage: { name: string } }) => (
  <div data-testid="heritage-card">{heritage.name}</div>
))

describe('HeritageFeed', () => {
  it('renders a card for each item', () => {
    render(<HeritageFeed items={heritageList} />)
    const cards = screen.getAllByTestId('heritage-card')
    expect(cards).toHaveLength(heritageList.length)
  })

  it('renders page indicator dots equal to item count', () => {
    render(<HeritageFeed items={heritageList} />)
    // dot buttons are rendered in the indicator area
    const dots = screen.getAllByRole('button', { name: /페이지/ })
    expect(dots).toHaveLength(heritageList.length)
  })

  it('renders each heritage name inside a card', () => {
    render(<HeritageFeed items={heritageList} />)
    heritageList.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })
})
