import { render, screen } from '@testing-library/react'
import VideoPlayer from '@/components/VideoPlayer'

const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
const mockIntersectionObserver = jest.fn(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}))

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  })
})

describe('VideoPlayer', () => {
  it('renders a video element with the given src', () => {
    render(<VideoPlayer src="/videos/test.mp4" />)
    const video = screen.getByTestId('video-player')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', '/videos/test.mp4')
  })

  it('attaches an IntersectionObserver on mount', () => {
    render(<VideoPlayer src="/videos/test.mp4" />)
    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })
})
