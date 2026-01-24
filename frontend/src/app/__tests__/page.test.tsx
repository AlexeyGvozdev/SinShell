import { render } from '@testing-library/react'
import Page from '../page'

describe('Home Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<Page />)
    expect(container).toBeTruthy()
  })
})