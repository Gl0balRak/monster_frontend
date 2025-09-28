import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../buttons/Button'

describe('Button Component', () => {
  it('отображает кнопку с текстом', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('обрабатывает клики', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    button.click()
    
    expect(handleClick).toHaveBeenCalledOnce()
  })
})