const supertest = require('supertest');
const app = require('../app');
const { describe, test, expect, beforeAll } = require('@jest/globals');
const db = require('../db');
const api = supertest(app);
let user;
let task;
let tasks = [
  {
    text: 'Ir a casa',
    checked: 0,
  },
  {
    text: 'Ir a la universidad',
    checked: 1,
  },
  {
    text: 'Comer hamburguesas',
    checked: 0,
  },
];
describe('ruta contacts', () => {
  describe('crear una tarea', () => {
    beforeAll(() => {
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('orlansierra25@gamil.com');
    });
    test('crea una tarea cuando todo es correcto', async () => {
      const response = await api
        .post('/api/task')
        .query({ userId: user.user_id })
        .send({ text: 'Comer empanadas', checked: 0 })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        task_id: 1,
        text: 'Comer empanadas',
        checked: 0,
        user_id: 1,
      });
    });
    test('no permite crear cuando es una tarea vacia', async () => {
      const response = await api
        .post('/api/task')
        .query({ userId: user.user_id })
        .send({ text: ' ' })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'Tarea invalida',
      });
    });
  });
  describe('eliminar tarea', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('sierraorlan25@gmail.com');

      // Creo una tarea
      const statementDeleteTasks = db.prepare('DELETE FROM task');
      statementDeleteTasks.run();
      const statementCreateTasks = db.prepare(
        `
      INSERT INTO task (text, checked, user_id) VALUES (?, ?, ?) RETURNING *
    `,
      );
      task = statementCreateTasks.get('Ir al cine', 1, user.user_id);
    });
    test('elimina una tarea cuando todo es correcto', async () => {
      const response = await api
        .delete(`/api/task/${task.task_id}`)
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'La tarea ha sido eliminada',
      });
    });
    test('no elimina la tarea cuando no pertenece al contacto', async () => {
      const response = await api
        .delete(`/api/task/${task.task_id}`)
        .query({ userId: user.user_id + 1 })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'La tarea no existe',
      });
    });
    test('no elimina cuando la tarea no existe', async () => {
      const response = await api
        .delete(`/api/task/${task.task_id + 1}`)
        .query({ userId: user.user_id })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'La tarea no existe',
      });
    });
  });
  describe('actualizar tarea', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('sierraorlan25@gmail.com');

      // Creo una tarea
      const statementDeleteTask = db.prepare('DELETE FROM task');
      statementDeleteTask.run();
      const statementCreateTask = db.prepare(
        `
      INSERT INTO task (text, checked, user_id) VALUES (?, ?, ?) RETURNING *
    `,
      );
      task = statementCreateTask.get('Comer empanadas', 0, user.user_id);
      console.log(task);
    });
    test('actualiza una tarea cuando todo es correcto', async () => {
      const response = await api
        .put(`/api/task/${task.task_id}`)
        .send({ text: 'Ir al baño', checked: 1 })
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        task_id: 1,
        text: 'Ir al baño',
        checked: 1,
        user_id: 1,
      });
    });
    test('no actualiza cuando la tarea no pertenece al contacto', async () => {
      const response = await api
        .put(`/api/task/${task.task_id}`)
        .query({ userId: user.user_id + 1 })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'La tarea no existe',
      });
    });
    test('no elimina cuando la tarea no existe', async () => {
      const response = await api
        .put(`/api/task/${task.task_id + 1}`)
        .query({ userId: user.user_id })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'La tarea no existe',
      });
    });
  });
  describe('obtener tareas', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('sierraorlan25@gmail.com');

      // Creo un contacto
      const statementDeleteTask = db.prepare('DELETE FROM task');
      statementDeleteTask.run();

      tasks = tasks.map((task) => {
        const statementCreateTask = db.prepare(
          `
        INSERT INTO task (text, checked, user_id) VALUES (?, ?, ?) RETURNING *
      `,
        );
        return statementCreateTask.get(task.text, task.checked, user.user_id);
      });
    });
    test('obtengo las tareas cuando todo es correcto', async () => {
      const response = await api
        .get('/api/task/')
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body.length).toBe(tasks.length);
    });
    test('obtengo las tareas cuando el usuario no inicio sesion', async () => {
      const response = await api
        .get('/api/task/')
        .query({ userId: null })
        .expect(401)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        error: 'No tienes los permisos',
      });
    });
  });
});
