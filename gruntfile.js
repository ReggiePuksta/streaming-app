/*jshint node:true*/
'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    var config = require('./configuration.js');
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        useminPrepare: {
            html: 'client/index.html'
        },
        clean: ["dist"],
        copy: {
            task0: {
                src: 'client/index.html',
                dest: 'dist/index.html'
            },
            task1: {
                expand: true,
                cwd: './client',
                src: 'vendor/*',
                dest: 'dist/'
            },
            task2: {
                expand: true,
                cwd: './client',
                src: 'partials/*',
                dest: 'dist/'
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 20
            },
            release: {
                src: [
                    'dist/js/*.js',
                    'dist/css/*.css',
                ]
            }
        },
        usemin: {
            html: 'dist/index.html',
            // options: {
            //     assetDirs: ['dist', 'dist/css', 'dist/js']
            // }
        },
        ngconstant: {
            options: {
                name: 'myApp',
                wrap: '"use strict";\n\n{%= __ngModule %}',
                //space: '  '
                deps: false,
            },
            development: {
                options: {
                    dest: 'client/constants.js',
                },
                constants: {
                    streamUrls: {
                        rtmpUrl: config.streamConfig.rtmpUrl,
                        hlsUrl: config.streamConfig.hlsUrl
                    }
                }
            }
        },
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

    grunt.registerTask('build', [
        'clean',
        'ngconstant:development',
        'useminPrepare',
        'copy:task0',
        'copy:task1',
        'copy:task2',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
    grunt.registerTask('ngtask', ['ngconstant:development']);
    grunt.registerTask('default', ['browserSync']);
};
