// @todo: remove data/journal directory before dpd run or end of import/export tasks

var path = require('path'),
    childprc = require('child_process'),
    fs = require('fs');

module.exports = function($, config) {

    var _ = $.lodash,
        appPath = path.resolve(process.cwd(), config.paths.deploydApp),
        dataPath = path.join(appPath, 'data'),
        exportPath = path.resolve(process.cwd(), config.paths.deploydExport),
        mongoServer, dpdProcess;

    /**
     * Run Deployd server. If called directly with task dpd it will produce interactive shell.
     *
     * @task dpd
     * @config tasks.deploydRun
     */
    function deploydRunTask() {
        // show interactive shell when run as clean "gulp dpd" task, not a part of tasks chain
        var showShell = _.indexOf(process.argv, config.tasks.deploydRun) > -1;
        runDeployd(config.deployd.openDashboard, showShell);
    }

    /**
     * Generate key for access to the dashboard needed in production environnent.
     *
     * @task dpd
     * @config tasks.deploydKeygen
     */
    function deploydKeygenTask() {
        callShellDpd('keygen');
    }

    /**
     * Show generated auth key for dashboard needed in production environment.
     *
     * @task dpd:import
     * @config tasks.deploydShowkey
     */
    function deploydShowkeyTask() {
        callShellDpd('showkey');
    }

    /**
     * Exports data from mongo db into exports dir
     *
     * @task dpd:import
     * @config tasks.deploydImport
     */
    function deploydExportTask() {

        if(_.isUndefined(config.deployd.db.host))
        {
            inMongo(function(){
                dump('localhost');
            });
        }
        else
        {
            dump(config.deployd.db.host);
        }
    }

    /**
     * Imports data from exports dir into mongo db
     *
     * @task dpd:import
     * @config tasks.deploydImport
     */
    function deploydImportTask() {

        if(_.isUndefined(config.deployd.db.host))
        {
            inMongo(function(){
                restore('localhost');
            });
        }
        else
        {
            restore(config.deployd.db.host);
        }
    }

    /**
     * Runs all published preServe tasks, just before actual serve takes place
     *
     * @task preServe
     * @config tasks.deploydPreServe
     * @config tasks.preServe
     * @deps dpd
     */
    function deploydPreServeTask(cb) {
        var preServeHooks = _.chain($.recipes)
            .pluck('preServe')
            .filter()
            .flatten()
            .value();

        $.utils.runSubtasks(preServeHooks, cb);
    }

    function runDeployd(openDashboard, interactive) {

        var args = [
            'dpd',
            path.join(appPath, 'app.dpd'),
            '--port', config.deployd.port,
            '--environment', config.deployd.env,
            '--mongoPort', config.deployd.db.port
        ];

        if(config.deployd.db.name !== undefined)
        {
            args.push('--dbname');
            args.push(config.deployd.db.name);
        }

        if(config.deployd.db.host !== undefined)
        {
            args.push('--host');
            args.push(config.deployd.db.host);
        }

        if(openDashboard)
        {
            args.push('-d');
        }

        dpdProcess = childprc.exec(args.join(' '), {
                async: true,
                stdio: 'ignore'
            },
            onError
        );

        dpdProcess.on('error', onError);
        if(interactive)
        {
            dpdProcess.stdout.pipe(process.stdout);
            process.stdin.pipe(dpdProcess.stdin);
        }
    }

    function callShellDpd(task) {
        process.chdir(appPath);
        var child = childprc.exec('dpd ' + task, {
            cwd: appPath,
            stdio: 'pipe'
        }, onError);

        child.stdout.pipe(process.stdout);
    }

    function dump(host) {

        var args = [
            '--host', host,
            '--port', config.deployd.db.port,
            '--out', exportPath,
            '--db', config.deployd.db.name || 'local'
        ];

        var task = 'mongodump ' + args.join(' ');

//        console.log('Running export: ' + task);

        var child = childprc.exec(task, {
            cwd: appPath
        }, function(error, stdin, stdout){
//            console.log('Export finished', stdin);
            if(error)
            {
                onError(error);
            }
        });

        child.on('exit', stopMongo);
        child.on('uncaughtException', stopMongo);
//        child.stdout.pipe(process.stdout);
    }

    function restore(host) {

        var args = [
            '--host', host,
            '--port', config.deployd.db.port,
            '--out', exportPath,
        ];
        var task = 'mongorestore ' + args.join(' ');

//        console.log('Running import: ' + task);

        var child = childprc.exec(task, {
            cwd: appPath
        }, function(error, stdin, stdout) {
//            console.log('Import finished', stdin);
            stopMongo();
            if(error)
            {
                onError(error);
            }
        });
    }

    function onError (error) {
        if (error !== null) {
            throw new $.gutil.PluginError('gulp-recipe-deployd', error);
        }
    }

    function inMongo(cb) {
        var args = [
            '--dbpath', dataPath,
            '--port', config.deployd.db.port
        ];

//        console.log('exec: mongod ' + args.join(' '));

        mongoServer = childprc.spawn('mongod', args, {
            cwd: appPath
        }, function(error, stdin){
            if(error)
            {
                if((''+stdin).indexOf('already running') > -1)
                {
                    cb();
                }
                else
                {
                    console.log(stdin);
                    stopMongo();
                }
            }
        });

        mongoServer.stdout.on('data', function (data) {
//            console.log('data', ''+data);
            if((''+data).indexOf('waiting for connections') > -1)
            {
                cb();
            }
        });
    }

    function stopMongo() {
//        console.log('Stopping mongo');
        if(mongoServer)
        {
            mongoServer.kill();
        }
        process.exit(0);
    }

    // register tasks
    $.utils.maybeTask(config.tasks.deploydRun, deploydRunTask);
    $.utils.maybeTask(config.tasks.deploydKeygen, deploydKeygenTask);
    $.utils.maybeTask(config.tasks.deploydShowkey, deploydShowkeyTask);
    $.utils.maybeTask(config.tasks.deploydImport, deploydImportTask);
    $.utils.maybeTask(config.tasks.deploydExport, deploydExportTask);
    $.utils.maybeTask(config.tasks.deploydPreServe, [config.tasks.deploydRun], deploydPreServeTask);

    return { };
};
