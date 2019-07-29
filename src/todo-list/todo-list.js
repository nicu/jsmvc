steal()
  .then('//src/todo-list/views/init.ejs')
  .then(function($) {
    $.Controller(
      'TodoList',
      {
        /* Static */
      },
      {
        todos: [],

        /* Prototype */
        init: function() {
          var self = this;

          Todo.findAll().then(function(todos) {
            self.todos = todos;
            self.render();
          });
        },

        render: function() {
          this.element.html('//src/todo-list/views/init.ejs', {
            todos: this.todos,
          });
        },

        '.todo-list li label dblclick': function(el) {
          el.parents('li').toggleClass('editing');
        },

        '.editing .edit blur': function(el) {
          var self = this;
          var li = el.parents('li');
          var todo = li.model();

          li.toggleClass('editing');
          todo.attr('text', el.val());
          if (!todo.errors()) {
            todo.save().then(function() {
              self.render();
            });
          }
        },

        '.toggle change': function(el) {
          var self = this;
          var li = el.parents('li');
          var todo = li.model();
          console.log(todo);
          todo.attr('completed', !todo.attr('completed'), function() {
            todo.save().then(function() {
              self.render();
            });
          });
        },
      }
    );
  });
