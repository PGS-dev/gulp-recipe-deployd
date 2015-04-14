module.exports = function ($, config) {
    config = $.lodash.merge({
        paths: {
            deploydApp: './dpd',
            deploydExport: './dpd/export/'
        },
        deployd: {
            app: 'app.dpd',
            port: 2403,
            env: 'development',
            db: {
                host: undefined,
                name: 'local',
                port: 27017
            },
            openDashboard: false
        },
        tasks: {
            deploydRun: 'dpd',
            deploydKeygen: 'dpd:keygen',
            deploydShowkey: 'dpd:showkey',
            deploydExport: 'dpd:export',
            deploydImport: 'dpd:import',
            deploydPreServe: 'preServe'
        }
    }, {
        tasks: {
            deploydPreServe: config.tasks.preServe
        }
    }, config);

    // remove original sources, so no unnecessary load is performed
    config.sources = undefined;

    return config;
};