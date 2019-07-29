steal('jmvc')
  .then('//src/models/todo.js')
  .then('//src/todo-list/todo-list.js')
  .then(function($) {
    $('#app').todo_list();
  });
