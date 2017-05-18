module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: "./src/public",
            src: [
              "**/*", 
              "!**/*.ts",
              "!**/*.scss"
            ],
            dest: "./dist/public"
          }
        ]
      }
    },
    ts: {
      app: {
        files: [{
          src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
          dest: "./dist"
        }],
        options: {
          module: "commonjs",
          target: "es6",
          sourceMap: false
        }
      }
    },
    sass: {      
      dist: {
        files: [{
          expand: true,
          cwd: "./src/public",
          src: ["**/app.scss"],
          dest: "./dist/public",
          ext: ".css"
        }]
      }
    },
    watch: {
      ts: {
        files: ["src/\*\*/\*.ts"],
        tasks: ["ts"]
      },
      sass: {
        files: ["src/\*\*/\*.scss"],
        tasks: ["sass"]
      },
      public: {
        files: ["src/\*\*/\*.html"],
        tasks: ["copy"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-sass");
  grunt.registerTask("default", [
    "copy",
    "ts",
    "sass"
  ]);
};