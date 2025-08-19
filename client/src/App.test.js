import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

jest.mock('axios');

const mockTasks = [
  { _id: '1', title: 'Test Task', completed: false },
];

describe('To-Do List UI', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockTasks });
    axios.post.mockResolvedValue({ data: mockTasks[0] });
    axios.put.mockResolvedValue({ data: { _id: '1', title: 'Test Task', completed: true } });
    axios.delete.mockResolvedValue({});
  });

  test('adds a task and displays it', async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/add a new task/i), { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText(/add/i));
    const task = await screen.findByText('Test Task');
    expect(task).toBeInTheDocument();
  });

  test('marks a task as complete', async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/add a new task/i), { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByText(/add/i));
    const completeBtn = await screen.findByText(/complete/i);
    await act(async () => {
      fireEvent.click(completeBtn);
    });
    const taskItem = screen.getByText('Test Task').closest('li');
    expect(taskItem).toHaveClass('completed');
  });
});
