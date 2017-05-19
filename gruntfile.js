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
      },
      lib: {
        files: [
          {
            expand: true,
            cwd: "./node_modules/",
            src: [
              "core-js/client/shim.min.js*",
              "zone.js/dist/zone.js",
              "rxjs/bundles/Rx.min.js",
              "rxjs/Observable.js*",
              "rxjs/observable/merge.js*",
              "rxjs/operator/share.js*",
              "rxjs/Subject.js*",
              "rxjs/util/root.js*",
              "rxjs/util/toSubscriber.js*",
              "rxjs/symbol/observable.js*",
              "rxjs/operator/merge.js*",
              "rxjs/operator/multicast.js*",
              "rxjs/Subscriber.js*",
              "rxjs/Subscription.js*",
              "rxjs/util/ObjectUnsubscribedError.js*",
              "rxjs/SubjectSubscription.js*",
              "rxjs/symbol/rxSubscriber.js*",
              "rxjs/Observer.js*",
              "rxjs/observable/ArrayObservable.js*",
              "rxjs/operator/mergeAll.js*",
              "rxjs/util/isScheduler.js*",
              "rxjs/observable/ConnectableObservable.js*",
              "rxjs/util/isFunction.js*",
              "rxjs/util/isArray.js*",
              "rxjs/util/isObject.js*",
              "rxjs/util/tryCatch.js*",
              "rxjs/util/errorObject.js*",
              "rxjs/util/UnsubscriptionError.js*",
              "rxjs/observable/ScalarObservable.js*",
              "rxjs/observable/EmptyObservable.js*",
              "rxjs/OuterSubscriber.js*",
              "rxjs/util/subscribeToResult.js*",
              "rxjs/util/isArrayLike.js*",
              "rxjs/util/isPromise.js*",
              "rxjs/symbol/iterator.js*",
              "rxjs/InnerSubscriber.js*",
              "@angular/core/bundles/core.umd.js*",
              "@angular/common/bundles/common.umd.js*",
              "@angular/compiler/bundles/compiler.umd.js*",
              "@angular/platform-browser/bundles/platform-browser.umd.js*",
              "@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js*",
              "systemjs/dist/system.src.js*",
            ],
            dest: "./dist/public/lib"
          }
        ]
      }
    },
    ts: {
      app: {
        tsconfig: true
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
        files: ["src/\*\*/\*.html", "src/\*\*/\*.js"],
        tasks: ["copy:build"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-sass");
  grunt.registerTask("default", [
    "copy:build",
    "ts",
    "sass"
  ]);
  grunt.registerTask("copy-lib", [
    "copy:lib"
  ]);
};