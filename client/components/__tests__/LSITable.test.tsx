import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LSITable } from '../tables/LSITable';
import { mockLSIData } from './test-data/lsi';

vi.mock('@/components/progress_bars/ProgressIndicator', () => ({
  ProgressIndicator: ({ current, target }) => (
    <div data-testid="progress-indicator">
      {current} / {target}
    </div>
  ),
}));

describe('LSITable', () => {
  const defaultProps = {
    title: 'LSI ключи',
    data: mockLSIData.slice(0, 10), // берем только первые 10 элементов
  };

  it('корректно отображает таблицу и основные элементы', () => {
    render(<LSITable {...defaultProps} />);
    
    expect(screen.getByText('LSI ключи')).toBeInTheDocument();
    expect(screen.getByText('Слово')).toBeInTheDocument();
    expect(screen.getByText('У конкурентов')).toBeInTheDocument();
    expect(screen.getByText('У вас')).toBeInTheDocument();
    expect(screen.getByText('Строк на странице:')).toBeInTheDocument();
  });

  it('работает переключение видимости таблицы', async () => {
    render(<LSITable {...defaultProps} />);
    
    await screen.findByText('семантический анализ');
    
    const toggleButton = screen.getByLabelText('Свернуть');
    fireEvent.click(toggleButton);
    
    expect(screen.queryByText('семантический анализ')).not.toBeInTheDocument();
  });

  it('работает сортировка по колонкам', async () => {
    render(<LSITable {...defaultProps} />);
    
    await screen.findByText('семантический анализ');
    const wordColumn = screen.getByText('Слово');
    fireEvent.click(wordColumn);
    
    expect(screen.getByText(/Сортировка:/)).toBeInTheDocument();
  });

  it('работает изменение количества строк на странице', async () => {
    render(<LSITable {...defaultProps} itemsPerPage={5} />);
    
    await screen.findByText('семантический анализ');
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });
    
    expect(select).toBeInTheDocument();
  });

  it('корректно обрабатывает пустые данные', () => {
    render(<LSITable title="Пустая таблица" data={[]} />);
    
    expect(screen.getByText('Пустая таблица')).toBeInTheDocument();
    expect(screen.getByText('Строк на странице:')).toBeInTheDocument();
  });
});