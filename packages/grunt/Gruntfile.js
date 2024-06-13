/*
 * grunt-real-favicon
 * https://github.com/RealFaviconGenerator/grunt-real-favicon
 *
 * Copyright (c) 2014 Philippe Bernard
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    realFavicon: {
      options: {
        settings: {
          // For scenario 1
          path: '/path/to/icons',
          // For scenario 2
          icon: {
            desktop: {
              regularIconTransformation: {
                type: 'background',
                backgroundColor: "#ffffff",
                backgroundRadius: 0.4,
                imageScale: 1,
              },
              darkIconType: "none",
            },
            touch: {
              transformation: {
                type: 'none',
              },
              appTitle: null
            },
            webAppManifest: {
              transformation: {
                type: 'none',
              },
              backgroundColor: "#ff0164",
              themeColor: "#ff0164",
              name: "Example",
              shortName: "Ex"
            }
          },
        },
        // For scenario 3
        html: ['tmp/scenario_3/page1.html', 'tmp/scenario_3/page2.html'],
      },
      scenario_1: {
        src: 'test/fixtures/sample_picture_2.png',
        dest: 'tmp/scenario_1',
        options: {
          html: ['tmp/scenario_1/page*.html', 'tmp/scenario_1/standalone.txt'],
          iconsPathCallback: function(match, href) {
            grunt.verbose.writeln('Callback with ' + match + " and " + href);
            return match.toUpperCase();
          },
          settings: {
            icon: {
              desktop: {
                regularIconTransformation: {
                  type: 'none',
                },
                darkIconType: "none",
              },
              touch: {
                transformation: {
                  type: 'none',
                },
                appTitle: null
              },
              webAppManifest: {
                transformation: {
                  type: 'none',
                },
                backgroundColor: "#ffffff",
                themeColor: "#ffffff",
                name: "Example",
                shortName: "Ex"
              }
            }
          }
        }
      },
      scenario_2: {
        src: 'test/fixtures/sample_picture.png',
        dest: 'tmp/scenario_2',
        options: {
          path: "/",
          html: ['tmp/scenario_2/page*.html'],
          keep: ['meta[property="og:image"]']
        }
      },
      scenario_3: {
        src: 'test/fixtures/sample_picture.png',
        dest: 'tmp/scenario_3',
        options: {
          settings: {
            path: '/yet/another/path',
            icon: {
              desktop: {
                regularIconTransformation: {
                  type: 'none',
                },
                darkIconType: "none",
              },
              touch: {
                transformation: {
                  type: 'none',
                },
                appTitle: null
              },
              webAppManifest: {
                transformation: {
                  type: 'none',
                },
                backgroundColor: "#ffffff",
                themeColor: "#ffffff",
                name: "Example",
                shortName: "Ex"
              }
            }
          },
          versioning: {
            paramName: 'theVersion',
            paramValue: '123456'
          }
        }
      },
    },

    // Copy HTML files (they are modified in place)
    copy: {
      scenario_1: {
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['*.html'], dest: 'tmp/scenario_1/'}
        ]
      },
      scenario_2: {
        files: [
        {expand: true, cwd: 'test/fixtures', src: ['*.html'], dest: 'tmp/scenario_2/'}
        ]
      },
      scenario_3: {
        files: [
        {expand: true, cwd: 'test/fixtures', src: ['*.html'], dest: 'tmp/scenario_3/'}
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'copy', 'realFavicon', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test']);
};
