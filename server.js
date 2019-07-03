const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

const resources = {};

const findIndex = (collection, id) =>
  collection.findIndex(item => item.id === id);

const createResource = name => {
  let id = 0;

  resources[name] = [];

  app.get('/' + name, (req, res) => {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(resources[name]));
  });

  app.post('/' + name, (req, res) => {
    const item = Object.assign(
      {
        id: ++id,
      },
      req.body
    );

    resources[name].push(item);

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(resources[name]));
  });

  app.get('/' + name + '/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = findIndex(resources[name], id);

    const item = resources[name][index];

    if (!item) {
      return res.send('Unknown index');
    }
    res.set('Content-Type', 'application/json');
    res.send(item);
  });

  app.put('/' + name + '/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = findIndex(resources[name], id);

    if (!resources[name][index]) {
      return res.send('Unknown index');
    }

    const item = Object.assign(resources[name][index], req.body);

    resources[name][index] = todo;

    res.set('Content-Type', 'application/json');
    res.send(req.body.todo);
  });

  app.delete('/' + name + '/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = findIndex(resources[name], id);
    if (!resources[name][index]) {
      return res.send('Unknown index');
    }

    resources[name].splice(index, 1);

    res.set('Content-Type', 'application/json');
    res.send(resources[name]);
  });
};

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

createResource('todos');
createResource('owners');

app.listen(port, () => console.log(`Todos app listening on port ${port}!`));
