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

      attributes: {
        text: 'string',
        date: 'dateTime',
      },

      convert: {
        dateTime: function(value) {
          const parts = value.split('-');
          if (parts.length === 3) {
            return value;
          }

          var milliseconds = parseInt(value, 10) * 1000;
          var date = new Date(milliseconds);
          return [date.getFullYear(), date.getMonth(), date.getDate()].join(
            '-'
          );
        },
      },
      serialize: {
        dateTime: function(raw) {
          const [year, month, day] = raw
            .split('-')
            .map(item => parseInt(item, 10));

          const date = new Date(year, month, day);
          return date.getTime() / 1000;
        },
      },

      init: function() {
        this.validate(['text', 'date'], function(value) {
          if (!(value && $.trim(value).length)) {
            return 'required';
          }
        });
      },
    },
    {
      /* prototype */
    }
  );
});
