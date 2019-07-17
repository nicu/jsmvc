steal('jmvc')
  .then('//src/models/todo.js')
  .then(function($) {
    console.log('TODO app');
  });
