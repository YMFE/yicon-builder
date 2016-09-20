'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _command = require('./command');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version('1.0.0');

_commander2.default.command('init').description('初始化 yicon 项目，进行数据库、登录配置').action(_command.init);

_commander2.default.command('start').description('启动 yicon 项目').action();

_commander2.default.parse(process.argv);