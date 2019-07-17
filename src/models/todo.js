steal(function($) {
  $.Model(
    'Todo',
    {
      /* static */
      findAll: 'GET http://localhost:3000/todos',
      findOne: 'GET http://localhost:3000/todos/{id}',
      create: 'POST http://localhost:3000/todos',
      update: 'PUT http://localhost:3000/todos/{id}',
      destroy: 'DELETE http://localhost:3000/todos/{id}',
    },
    {
      /* prototype */
    }
  );
});
