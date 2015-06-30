module.exports = function(grunt) {

    require('loadup-grunt-tasks')(grunt);

    grunt.initConfig({

        jade: {
            default: {
                // dynamically updated by watcher (see below)
                src: null, dest: null
            },
            base: {
                src: '*/**/*.jade',
                expand: true,
                ext: '.html'
            }
        },

        watchChokidar: {
            default: {
                options: { spawn: false },
                files: ['*/**/*.jade'],
                tasks: ['jade:default']
            },
            base: {
                files: 'base.jade',
                tasks: ['jade:base']
            }
        }

    });

    grunt.event.on('watchChokidar', function(action, filepath) {
        grunt.config('jade.default.src', filepath);
        grunt.config('jade.default.dest', filepath.slice(0, -4) + 'html');
    });

    grunt.registerTask('default', ['watchChokidar']);

};
