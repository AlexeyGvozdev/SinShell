/**
 * Тесты для компонента TerminalLine
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TerminalLine } from '../TerminalLine';

describe('TerminalLine', () => {
  it('должен рендериться без ошибок', () => {
    render(<TerminalLine type="output" content="test" />);
    expect(screen.getByTestId('terminal-line-output')).toBeInTheDocument();
  });

  it('должен отображать текстовый контент', () => {
    render(<TerminalLine type="output" content="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('должен отображать React элементы в контенте', () => {
    const content = <div data-testid="custom-content">Custom Content</div>;
    render(<TerminalLine type="output" content={content} />);
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('должен отображать промпт когда prompt=true', () => {
    const { container } = render(
      <TerminalLine type="command" content="ls" prompt />
    );
    
    const prompt = container.querySelector('.terminal-prompt');
    expect(prompt).toBeInTheDocument();
    expect(prompt).toHaveTextContent('$');
  });

  it('не должен отображать промпт когда prompt=false', () => {
    const { container } = render(
      <TerminalLine type="output" content="result" prompt={false} />
    );
    
    const prompt = container.querySelector('.terminal-prompt');
    expect(prompt).not.toBeInTheDocument();
  });

  it('должен применять правильный CSS класс для типа command', () => {
    render(<TerminalLine type="command" content="test" />);
    const line = screen.getByTestId('terminal-line-command');
    expect(line).toHaveClass('terminal-line--command');
  });

  it('должен применять правильный CSS класс для типа output', () => {
    render(<TerminalLine type="output" content="test" />);
    const line = screen.getByTestId('terminal-line-output');
    expect(line).toHaveClass('terminal-line--output');
  });

  it('должен применять правильный CSS класс для типа error', () => {
    render(<TerminalLine type="error" content="test" />);
    const line = screen.getByTestId('terminal-line-error');
    expect(line).toHaveClass('terminal-line--error');
  });

  it('должен применять правильный CSS класс для типа success', () => {
    render(<TerminalLine type="success" content="test" />);
    const line = screen.getByTestId('terminal-line-success');
    expect(line).toHaveClass('terminal-line--success');
  });

  it('должен применять правильный CSS класс для типа info', () => {
    render(<TerminalLine type="info" content="test" />);
    const line = screen.getByTestId('terminal-line-info');
    expect(line).toHaveClass('terminal-line--info');
  });

  it('должен применять кастомный className', () => {
    render(
      <TerminalLine type="output" content="test" className="custom-class" />
    );
    
    const line = screen.getByTestId('terminal-line-output');
    expect(line).toHaveClass('custom-class');
  });

  it('должен иметь базовый класс terminal-line', () => {
    render(<TerminalLine type="output" content="test" />);
    const line = screen.getByTestId('terminal-line-output');
    expect(line).toHaveClass('terminal-line');
  });

  it('должен отображать пустой контент', () => {
    render(<TerminalLine type="output" content="" />);
    const line = screen.getByTestId('terminal-line-output');
    expect(line).toBeInTheDocument();
  });

  it('должен отображать числовой контент', () => {
    render(<TerminalLine type="output" content={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('промпт должен иметь правильный ARIA label', () => {
    const { container } = render(
      <TerminalLine type="command" content="test" prompt />
    );
    
    const prompt = container.querySelector('.terminal-prompt');
    expect(prompt).toHaveAttribute('aria-label', 'command prompt');
  });
});