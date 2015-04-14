# [gulp-recipe](https://github.com/PGS-dev/gulp-recipe-loader)-deployd [![Dependency Status][depstat-image]][depstat-url]
[![NPM][npm-image]][npm-url]
# gulp-recipe-loader [![Dependency Status][depstat-image]][depstat-url]
[![NPM][npm-image]][npm-url]

Easy Deployd integration

## Tasks
### dpd

Run Deployd server with its own MongoDB server if needed.

### dpd:export

Dump db data to specified export path.

### dpd:import

Import previously exported db data to mongo.

## Configuration
### Recipe specific
#### deployd.env
> default: 'development'<br>
> type: string

Environment variable of Deployd server. When set to "development" you do not need access key to open dashboard.

#### deployd.port
> default: 2403<br>
> type: integer

Port for running Deployd server.

#### deployd.db
> type: object

Configuration object for mongo connection.

#### deployd.db.host
> default: undefined<br>
> type: string

If host is undefined Deployd will run its own instance of mongod (you may set other params like port or database name). If you provide any hostname (even 'localhost'), Deployd will assume mongo server is already running, and will try to connect to it.

#### deployd.db.port
> default: 27017<br>
> type: integer

Port of mongod server being used.

#### deployd.db.name
> default: 'local'<br>
> type: string

Name of mongo database being used. Please avoid names prefixed with dash (eg. '-deployd'), as there is bug in Command.js used internally by Deployd that will prevent it from running properly.

#### deployd.openDashboard
> default: false<br>
> type: boolean

If set to true, Deployd dashboard will be automatically opened in the browser when server is started.

### Paths
#### paths.deploydApp
> default: './dpd'

Deployd app directory path.

#### paths.deploydExport
> default: './dpd/export'

Default directory for exports. Mongo dumps will be stored and restored from here.


[npm-url]: https://npmjs.org/package/gulp-recipe-deployd
[npm-image]: https://nodei.co/npm/gulp-recipe-deployd.png?downloads=true
[depstat-url]: https://david-dm.org/PGS-dev/gulp-recipe-deployd
[depstat-image]: https://img.shields.io/david/PGS-dev/gulp-recipe-deployd.svg?style=flat