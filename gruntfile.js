/*jshint node:true*/
'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        myApp: {
            dist: 'dist'
        },
        browserSync: {
            bsFiles: {
                src: ['./**/*.html', './**/*.js', './**/*.css']
            },
            options: {
                proxy: "localhost:5000"
            }
        }

    });
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.registerTask('default', ['browserSync']);
};
