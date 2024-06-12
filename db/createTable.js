const db = require('.');

//forma de agregar table
const createUsersTable = async () => {
  const statement = db.prepare(` 
  
  CREATE TABLE  users (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
  
  )
  `);
  statement.run(); //corriendo la variable y la base de datos
  console.log('tabla de usuarios creada');
};

//forma de agregar table
const createTaskTable = async () => {
  const statement = db.prepare(` 
    
    CREATE TABLE  task (
      task_id INTEGER PRIMARY KEY,
      text TEXT NOT NULL ,
      checked TEXT NOT NULL ,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE

    
    )
    `);
  statement.run(); //corriendo la variable y la base de datos
  console.log('tabla de tareas creada');
};

const createTables = async () => {
  await createUsersTable();
  await createTaskTable();
};

createTables();
