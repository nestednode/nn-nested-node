var path = require('path');
var findup = require('findup-sync');
var matchdep = require('matchdep');


module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('bower.json');
    var mainFileName = pkg.main.slice(0, -3); //cut .js ext

    grunt.initConfig({

        typescript: {
            default: {
                src: 'src/' + mainFileName + '.ts',
                dest: __dirname, // dont use './'
                options: {
                    module: 'amd',
                    target: 'es5',
                    basePath: 'src',
                    //sourceMap: true,
                    //noImplicitAny: true, //Warn on implied 'any' type
                    //preserveConstEnums: true, //Do not erase const enum declarations in generated code
                    declaration: true
                }
            }
        },

        clean: ['lib/', mainFileName + '.js', mainFileName + '.d.ts'],

        watch: {
            ts: {
                files: 'src/**/*.ts',
                tasks: ['compile']
            }
        }

    });

    matchdep.filterDev('grunt-*').forEach(function(plugin) {
//        grunt.loadNpmTasks(plugin); // no tree lookup
        grunt.loadTasks(findup(path.join('node_modules', plugin, 'tasks')));
    });

    grunt.registerTask('compile', ['typescript']);
    grunt.registerTask('recompile', ['clean', 'compile']);
    grunt.registerTask('default', ['compile', 'watch']);

};
