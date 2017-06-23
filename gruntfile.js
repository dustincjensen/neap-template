var browserSync = require('browser-sync').create();

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        // This is will compile the build utils and then run it
        // to generate the serviceProxy for the client from the api
        // definitions.
        exec: {
            compileProxyGenerator: {
                command: 'tsc ./src/utils/codeGeneration/proxy/proxyGeneration.ts -m commonjs -outdir ./generator',
                sync: true
            },
            runProxyGenerator: {
                command: 'node ./generator/proxy/proxyGeneration.js src/api/'
            },
            compileDatabaseSchemaGenerator: {
                command: 'tsc ./src/utils/codeGeneration/database/databaseSchemaGeneration.ts -m commonjs -outdir ./generator',
                sync: true
            },
            runDatabaseSchemaGenerator: {
                command: 'node ./generator/database/databaseSchemaGeneration.js src/db/models/'
            }
        },
        // The copy task moves files from one place to another.
        // We have 2 copy tasks.
        // - build 
        // - lib
        //
        // Build is run on grunt watches and just a regular grunt.
        // Build will move any file that is not .ts or .scss to the
        // dist/public folder. This is important for our html and .js
        // files that don't need to be compiled.
        // 
        // Lib is selectively run because it copies node_module files
        // into a dist/public/lib. This is to support Angular2 on the client.
        // if it needs to be done, the command npm run grunt copy:lib 
        // should be run.
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
                            "rxjs/observable/fromPromise.js*",
                            "rxjs/observable/forkJoin.js*",
                            "rxjs/observable/ForkJoinObservable.js*",
                            "rxjs/observable/PromiseObservable.js*",
                            "rxjs/OuterSubscriber.js*",
                            "rxjs/util/subscribeToResult.js*",
                            "rxjs/util/isArrayLike.js*",
                            "rxjs/util/isPromise.js*",
                            "rxjs/symbol/iterator.js*",
                            "rxjs/InnerSubscriber.js*",
                            "rxjs/add/operator/toPromise.js*",
                            "rxjs/operator/toPromise.js*",
                            "rxjs/operator/map.js*",
                            "@angular/core/bundles/core.umd.js*",
                            "@angular/common/bundles/common.umd.js*",
                            "@angular/compiler/bundles/compiler.umd.js*",
                            "@angular/platform-browser/bundles/platform-browser.umd.js*",
                            "@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js*",
                            "@angular/http/bundles/http.umd.js*",
                            "@angular/forms/bundles/forms.umd.js*",
                            "systemjs/dist/system.src.js*",
                        ],
                        dest: "./dist/public/lib"
                    }
                ]
            }
        },
        // This supports typescript compilation.
        // We used to specify the options and files here, but since VsCode
        // will not shut up about experimentalDecorators unless you specify
        // it in the tsconfig file, I opted to move the rest of the typescript
        // definitions there.
        ts: {
            app: {
                tsconfig: true
            }
        },
        // This support scss compilation.
        // This looks in the /src/public folder for the app.scss file.
        // Important to note that ONLY app.scss is looked for. This means
        // it should import the rest of the .scss files (or some chain of them).
        // TODO minify the app.css that is produced from this.
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "./src/public",
                    src: ["**/styles.scss"],
                    dest: "./dist/public",
                    ext: ".css"
                }]
            }
        },
        // This will clean out the dist folder.
        // This removes the folder and all of its contents. Essentially
        // cleans our output because it has files that shouldn't exist
        // any more.
        clean: {
            release: ['dist', 'generator']
        },
        // This supports running tasks whenever one of the events occurs.
        // ts -- should occur whenever a change is detected in a .ts file in the src folder.
        // sass -- should occur whenever a change is detected in a .scss file in the src folder.
        // public -- should occur whenever a change is detected in .html or .js files in the src folder.
        watch: {
            ts: {
                files: ["src/\*\*/\*.ts"],
                tasks: ["ts", "bs-reload"]
            },
            sass: {
                files: ["src/\*\*/\*.scss"],
                tasks: ["sass", "bs-reload"]
            },
            public: {
                files: ["src/\*\*/\*.html", "src/\*\*/\*.js"],
                tasks: ["copy:build", "bs-reload"]
            },
            // The spawn false is needed otherwise it won't work with
            // the browser sync reload.
            options: {
                spawn: false
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-sass");

    // Register "grunt"
    // This is the default items that will be run when you run the command npm run grunt.
    grunt.registerTask("default", [
        "copy:build",
        "ts",
        "sass"
    ]);

    // Register "full"
    // This task will clean, deploy lib, move files, compile ts and compile the scss.
    grunt.registerTask("full", [
        "clean",
        "exec:compileProxyGenerator",
        "exec:runProxyGenerator",
        "exec:compileDatabaseSchemaGenerator",
        "exec:runDatabaseSchemaGenerator",
        "copy",
        "ts",
        "sass"
    ]);

    // Register "createDatabaseSchema"
    // This will run the generation tool for creating the database "Create Table" sql.
    grunt.registerTask("createDatabaseSchema", [
        "exec:compileDatabaseSchemaGenerator",
        "exec:runDatabaseSchemaGenerator"
    ]);

    // Starts the browser sync modules and watches for changes to files.
    grunt.registerTask("watch-task", [
        "bs-init",
        "watch"
    ]);

    // Register browserSync-init.
    // This shouldn't be called on the command line by itself.
    grunt.registerTask("bs-init", function () {
        var done = this.async();
        browserSync.init({
            // Same URL that is in /bin/www
            proxy: "http://localhost:8080",
            browser: ['chrome']
        }, function (err, bs) {
            done();
        });
    });

    // Register browserSync-reload.
    // This shouldn't be called on the command line by itself.
    grunt.registerTask("bs-reload", function () {
        browserSync.reload();
    });
};