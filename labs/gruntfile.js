//var path =

module.exports = function(grunt) {

    require('loadup-grunt-tasks')(grunt);

    grunt.initConfig({

        typescript: {
            default: {
                options: { module: 'amd', target: 'es5' },
                src: null // dynamically updated by watcher (see below)
            }
        },

        watchChokidar: {
            default: {
                options: { spawn: false },
                files: ['**/*.ts'],
                tasks: ['typescript']
            }
        }

    });

    grunt.event.on('watchChokidar', function(action, filepath) {
        grunt.config('typescript.default.src', filepath);
    });

    grunt.registerTask('default', ['watchChokidar']);

};
