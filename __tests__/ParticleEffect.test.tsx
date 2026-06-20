import { render, act } from '@testing-library/react'
import ParticleEffect from '@/features/like/ui/ParticleEffect'

jest.useFakeTimers()

describe('ParticleEffect', () => {
  it('renders no particles initially when trigger is 0', () => {
    const { container } = render(<ParticleEffect trigger={0} />)
    expect(container.querySelectorAll('span')).toHaveLength(0)
  })

  it('renders a particle when trigger increments from 0 to 1', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    expect(container.querySelectorAll('span').length).toBeGreaterThan(0)
  })

  it('removes the particle after 1500ms', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    act(() => { jest.advanceTimersByTime(1500) })
    expect(container.querySelectorAll('span')).toHaveLength(0)
  })

  it('adds a new particle for each trigger increment', () => {
    const { container, rerender } = render(<ParticleEffect trigger={0} />)
    rerender(<ParticleEffect trigger={1} />)
    rerender(<ParticleEffect trigger={2} />)
    expect(container.querySelectorAll('span').length).toBe(2)
  })
})
