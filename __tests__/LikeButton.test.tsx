import { render, screen, fireEvent } from '@testing-library/react'
import LikeButton from '@/components/LikeButton'

describe('LikeButton', () => {
  it('shows initial count', () => {
    render(<LikeButton initialCount={42} onLike={() => {}} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('increments count on click', () => {
    render(<LikeButton initialCount={42} onLike={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('43')).toBeInTheDocument()
  })

  it('calls onLike callback on click', () => {
    const onLike = jest.fn()
    render(<LikeButton initialCount={0} onLike={onLike} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onLike).toHaveBeenCalledTimes(1)
  })

  it('formats count >= 1000 as Xk', () => {
    render(<LikeButton initialCount={1200} onLike={() => {}} />)
    expect(screen.getByText('1.2k')).toBeInTheDocument()
  })

  it('can be clicked multiple times', () => {
    render(<LikeButton initialCount={0} onLike={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
