'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _command = require('./command');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version);

_commander2.default.command('init').description('初始化 yicon 项目，进行数据库、登录配置').action(_command.init);

_commander2.default.parse(process.argv);

if (!_commander2.default.args.length) _commander2.default.help();