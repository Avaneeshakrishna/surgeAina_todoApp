const request = require('supertest');
const app = require('./index');

describe('Tasks API', () => {
  test('POST /tasks creates a task', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Test Task' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
  });

  test('DELETE /tasks/:id deletes a task', async () => {
    // First, create a task
    const createRes = await request(app).post('/tasks').send({ title: 'Test Task' });
    const id = createRes.body._id;
    // Now, delete the created task
    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
});
