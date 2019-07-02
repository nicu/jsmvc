/*global load:false*/

load('steal/rhino/rhino.js');

steal('steal/build/pluginify', function () {
    steal.build.pluginify('jmvc', {
        out: 'dist/jmvc.js',
        nojquery: true
    })
});
