import { render, screen, fireEvent } from '@testing-library/react'
import HeritageCard from '@/widgets/shorts-swiper/ui/HeritageCard'
import { heritageList } from '@/entities/heritage/data/heritageList'

jest.mock('@/shared/ui/VideoPlayer/VideoPlayer', () => () => <div data-testid="video-player" />)
jest.mock('@/features/like/ui/ParticleEffect', () => ({ trigger }: { trigger: number }) => (
  <div data-testid="particle-effect" data-trigger={trigger} />
))

const heritage = heritageList[0]

describe('HeritageCard', () => {
  it('renders heritage name', () => {
    render(<HeritageCard heritage={heritage} />)
    expect(screen.getByText(heritage.name)).toBeInTheDocument()
  })

  it('renders 더보기 link pointing to detail page', () => {
    render(<HeritageCard heritage={heritage} />)
    const link = screen.getByRole('link', { name: /더보기/ })
    expect(link).toHaveAttribute('href', `/heritage/${heritage.id}`)
  })

  it('increments particle trigger when like button is clicked', () => {
    render(<HeritageCard heritage={heritage} />)
    const likeBtn = screen.getByRole('button', { name: '좋아요' })
    expect(screen.getByTestId('particle-effect')).toHaveAttribute('data-trigger', '0')
    fireEvent.click(likeBtn)
    expect(screen.getByTestId('particle-effect')).toHaveAttribute('data-trigger', '1')
  })
})
