module.exports = function(grunt) {

    require('loadup-grunt-tasks')(grunt);

    grunt.initConfig({

        typescript: {
            default: {
                src: 'src/NNDocument.ts',
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

        clean: [
            'lib/*'
        ],

        watch: {
            ts: {
                files: 'src/**/*.ts',
                tasks: ['compile']
            }
        }

    });

    grunt.registerTask('compile', ['clean', 'typescript']);
    grunt.registerTask('default', ['compile', 'watch']);

};
