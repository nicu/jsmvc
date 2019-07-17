steal('jquery/controller/view')
  .then('//src/app/views/app.ejs')
  .then(function($) {
    $.Controller(
      'AppController',
      {
        /* static */
      },
      {
        /* prototype */
        init: function() {
          this.render();
        },

        render: function() {
          this.element.html(
            this.view('//src/app/views/app.ejs', { todos: Todo.findAll() })
          );
        },

        // listen to 'change' events on all elements
        // with the class name of 'new-todo'
        '.new-todo change': function(input) {
          input.val('');
        },

        '.todo-list li dblclick': function(li) {
          li.addClass('editing');
        },

        '.edit change, .edit blur': function(input) {
          var self = this;
          var li = input.parents('li');
          // li.removeClass('editing');
          li.model()
            .attr('text', input.val())
            .save()
            .then(function() {
              self.render();
            });
        },
      }
    );
  });
