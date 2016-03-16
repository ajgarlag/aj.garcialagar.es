module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            main: {
                files: {
                    'src/content/assets/js/ajgl.min.js': [
                        'src/content/assets/js/clean-blog.js'
                    ]
                }
            }
        },
        less: {
            expanded: {
                options: {
                    paths: ["src/content/assets/css"]
                },
                files: {
                    "src/content/assets/css/clean-blog.css": "src/less/clean-blog.less"
                }
            },
            minified: {
                options: {
                    paths: ["src/content/assets/css"],
                    cleancss: true
                },
                files: {
                    "src/content/assets/css/ajgl.min.css": [
                        "src/content/assets/css/clean-blog.css"
                    ]
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/content/assets/js/*.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false
                }
            },
            less: {
                files: ['src/content/assets/less/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false
                }
            }
        }
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'less']);

};
