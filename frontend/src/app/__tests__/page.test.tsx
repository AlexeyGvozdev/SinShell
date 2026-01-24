import { render } from '@testing-library/react'
import Page from '../page'
import { ThemeProvider } from '@/context/ThemeContext'

describe('Home Page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )
    expect(container).toBeTruthy()
  })
})