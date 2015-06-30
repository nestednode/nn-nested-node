module.exports = function(grunt) {

    require('loadup-grunt-tasks')(grunt);

    grunt.initConfig({

        typescript: {
            default: {
                src: 'src/lib.ts',
                dest: 'lib/',
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

        less: {
            default: {
                src: 'src/NestedNodeStyle/NestedNodeStyle.less',
                expand: true,
                ext: '.css'
            }
        },

        copy: {
            default: {
                src: 'src/NestedNodeStyle/NestedNodeStyle.css',
                dest: 'lib/NestedNodeStyle/NestedNodeStyle.css',
                nonull: true
            }
        },

        clean: [
            'lib/*'
        ],

        watch: {
            ts: {
                files: 'src/**/*.ts',
                tasks: ['typescript']
            },
            less: {
                files: 'src/NestedNodeStyle/*.less',
                tasks: ['style']
            }
        }

    });

    grunt.registerTask('style', ['less', 'copy']);
    grunt.registerTask('compile', ['typescript', 'style']);
    grunt.registerTask('default', ['clean', 'compile', 'watch']);

};
