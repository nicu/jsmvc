steal('jmvc')
  .then('//src/models/todo.js')
  .then('//src/app/app.controller.js')
  .then(function($) {
    $('#app').app();
  });
