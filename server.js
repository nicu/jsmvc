const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

const todos = [];
let index = 0;

const findTodoIndex = id => todos.findIndex(todo => todo.id === id);

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/todos', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(todos));
});

app.post('/todos', (req, res) => {
  const todo = Object.assign(
    {
      id: ++index,
    },
    req.body
  );

  todos.push(todo);

  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(todos));
});

app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = findTodoIndex(id);

  const todo = todos[index];

  if (!todo) {
    return res.send('Unknown index');
  }
  res.set('Content-Type', 'application/json');
  res.send(todo);
});

app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = findTodoIndex(id);

  if (!todos[index]) {
    return res.send('Unknown index');
  }

  const todo = Object.assign(todos[index], req.body);

  todos[index] = todo;

  res.set('Content-Type', 'application/json');
  res.send(req.body.todo);
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = findTodoIndex(id);
  if (!todos[index]) {
    return res.send('Unknown index');
  }

  todos.splice(index, 1);

  res.set('Content-Type', 'application/json');
  res.send(todos);
});

app.listen(port, () => console.log(`Todos app listening on port ${port}!`));
