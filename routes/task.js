const db = require('../db');

const taskRouter = require('express').Router();

taskRouter.post('/', async (request, response) => {
  try {
    // Obtener el texto y el checked del body
    const { text, checked } = request.body;
    // Validar que la tarea no este vacia
    if (text === ' ') {
      return response.status(400).json({ message: 'Tarea invalida' });
    }
    //Crear el usuario en la base de datos
    const statement = db.prepare(
      `
    INSERT INTO task (text, checked, user_id) VALUES (?, ?, ?) RETURNING *
  `,
    );
    const newTask = statement.get(text, checked, Number(request.query.userId));
    // Asegurarse de que `checked` sea un número
    newTask.checked = Number(newTask.checked);
    return response.status(200).json(newTask);
  } catch (error) {
    console.log(error);
    console.log('error loco');
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('error sql');
      return response.status(400).json({ error: 'El email ya esta en uso' });
    }

    return response.sendStatus(400);
  }
});

// eliminar una tarea
taskRouter.delete('/:id', async (request, response) => {
  try {
    // Obtener el nombre y el telefono del body
    const taskIdToDelete = request.params.id;
    // Crear el usuario en la base de datos
    const statement = db.prepare(
      `
    DELETE FROM task WHERE task_id = ? AND user_id = ? RETURNING *
  `,
    );
    const deleteTask = statement.get(Number(taskIdToDelete), Number(request.query.userId));
    if (!deleteTask) {
      return response.status(400).json({ message: 'La tarea no existe' });
    }
    return response.status(200).json({ message: 'La tarea ha sido eliminada' });
  } catch (error) {
    console.log(error);
    console.log('error loco');
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('error sql');
      return response.status(400).json({ error: 'El email ya esta en uso' });
    }

    return response.sendStatus(400);
  }
});

taskRouter.put('/:id', async (request, response) => {
  try {
    // Obtener el id de la tarea y el usuaario del body
    const taskId = Number(request.params.task_id);
    const userId = Number(request.query.userId);
    // Asegurarse de que `checked` sea un número

    const { text, checked } = request.body;

    if (isNaN(taskId) || isNaN(userId)) {
      return response.status(400).json({ message: 'La tarea no existe' });
    }
    // Crear el usuario en la base de datos
    const statement = db.prepare(
      `
    UPDATE task  SET 
        text = ?, 
        checked = ?         
      WHERE 
        task_id = ? AND user_id = ?
         RETURNING *
  `,
    );
    const updateTask = statement.get(
      text,
      checked,
      Number(request.params.taskId),
      Number(request.query.userId),
    );
    return response.status(200).json(updateTask);
  } catch (error) {
    console.log(error);
    console.log('error loco');
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('error sql');
      return response.status(400).json({ error: 'El email ya esta en uso' });
    }

    return response.sendStatus(400);
  }
});

//OBTIENE UNA TAREA
taskRouter.get('/', async (request, response) => {
  try {
    // Crear el usuario en la base de datos
    const statement = db.prepare(
      `
    SELECT * FROM task        
    WHERE user_id = ?
  `,
    );
    const tasks = statement.all(Number(request.query.userId));
    return response.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    console.log('error loco');
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('error sql');
      return response.status(400).json({ error: 'El email ya esta en uso' });
    }

    return response.sendStatus(400);
  }
});
module.exports = taskRouter;
