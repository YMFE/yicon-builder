'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _child_process = require('child_process');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getConfig = function getConfig(filename) {
  return {
    log: {
      appenders: [{
        category: 'normal',
        type: 'dateFile',
        filename: filename,
        alwaysIncludePattern: true,
        pattern: '-yyyy-MM-dd.log'
      }]
    }
  };
};

var dir = void 0;

var getChoiceItem = function getChoiceItem(item) {
  return item.replace(/^\d+\) /, '');
};

// 修复相对路径
var mixDirPath = function mixDirPath(dir) {
  var cwd = process.cwd();
  return (/^\//.test(dir) ? dir : _path2.default.join(cwd, dir)
  );
};

var $command = function $command(p) {
  return _path2.default.join(__dirname, p);
};
var $install = function $install(p) {
  return _path2.default.join(dir, p);
};

// 将 src 资源文件复制到指定目录
var copySource = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _utils.sp)('git', ['clone', '--progress', '-b', 'deploy', 'https://github.com/YMFE/yicon'], $install('/src'));

          case 2:
            _context.next = 4;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../template/config.js') + '" "' + $install('/src/src') + '"');

          case 4:
            _context.next = 6;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../template/start.sh') + '" "' + $install('/src') + '"');

          case 6:
            _context.next = 8;
            return _q2.default.nfcall(_child_process.exec, 'mkdir "' + $install('/logs') + '"');

          case 8:

            _utils.log.done('项目初始化完成');

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function copySource() {
    return _ref.apply(this, arguments);
  };
}();

var getDBConfig = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(config) {
    var questions;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _utils.log.info('输入数据库配置项，回车接受默认值');

            questions = [{
              type: 'input',
              name: 'host',
              message: '请输入数据库域名或 IP 地址:',
              default: '127.0.0.1'
            }, {
              type: 'input',
              name: 'username',
              message: '请输入数据库用户名:',
              default: 'root'
            }, {
              type: 'input',
              name: 'password',
              message: '请输入数据库密码:',
              default: '123456'
            }, {
              type: 'input',
              name: 'port',
              message: '请输入数据库端口号:',
              default: '3306'
            }, {
              type: 'input',
              name: 'database',
              message: '请输入数据库名称:',
              default: 'iconfont'
            }];
            _context2.next = 4;
            return _inquirer2.default.prompt(questions);

          case 4:
            config.model = _context2.sent;


            config.model.dialect = 'mysql';

            return _context2.abrupt('return', config);

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getDBConfig(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var getLoginConfig = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(config) {
    var questions, _ref4, type;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            questions = [{
              type: 'list',
              message: '选择登录类型',
              name: 'type',
              choices: ['1) sso', '2) cas']
            }];
            _context3.next = 3;
            return _inquirer2.default.prompt(questions);

          case 3:
            _ref4 = _context3.sent;
            type = _ref4.type;


            config.login = {
              type: getChoiceItem(type),
              authUrl: 'http://cas.example.com/cas/login?service={{service}}',
              tokenUrl: 'http://cas.example.com/serviceValidate?service={{service}}&ticket={{token}}',
              serviceUrl: 'http://app.iconfont.com',
              adminList: []
            };

            return _context3.abrupt('return', config);

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getLoginConfig(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var writeConfigFile = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(config) {
    var content, configFile;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            content = JSON.stringify(config, null, 2);
            configFile = $install('/config.json');
            _context4.next = 4;
            return _q2.default.nfcall(_fs2.default.writeFile, configFile, content);

          case 4:

            _utils.log.dim('您的数据库配置和日志配置如下，可以手工修改 ' + _chalk2.default.yellow(configFile) + ' 来改变配置');
            _utils.log.dim(content);

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function writeConfigFile(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

var authDBConnection = function () {
  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(config) {
    var _config$model, host, username, password, port, database, seq, initDB, _ref7, init;

    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _config$model = config.model;
            host = _config$model.host;
            username = _config$model.username;
            password = _config$model.password;
            port = _config$model.port;
            database = _config$model.database;
            seq = new _sequelize2.default(database, username, password, {
              port: port, host: host, logging: false, dialectOptions: { multipleStatements: true }
            });
            initDB = false;
            _context5.prev = 8;
            _context5.next = 11;
            return seq.authenticate();

          case 11:
            _utils.log.done('数据库连接成功');
            _context5.next = 14;
            return _inquirer2.default.prompt([{
              type: 'confirm',
              name: 'init',
              message: '是否初始化数据库?',
              default: false
            }]);

          case 14:
            _ref7 = _context5.sent;
            init = _ref7.init;

            if (!initDB) {
              _context5.next = 19;
              break;
            }

            _context5.next = 19;
            return importDBData(seq);

          case 19:
            _context5.next = 24;
            break;

          case 21:
            _context5.prev = 21;
            _context5.t0 = _context5['catch'](8);

            _utils.log.error('导入数据库失败，错误信息为：' + _context5.t0.message);

          case 24:
            if (initDB) {
              _context5.next = 28;
              break;
            }

            _utils.log.dim('如需初始化，请手工导入安装路径根目录下 sql 脚本建表');
            _context5.next = 28;
            return _q2.default.nfcall(_child_process.exec, 'cp "' + $command('../../template/iconfont.sql') + '" "' + $install('/iconfont.sql') + '"');

          case 28:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined, [[8, 21]]);
  }));

  return function authDBConnection(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

var importDBData = function () {
  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(seq) {
    var sqlFile, content, sqlList;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            sqlFile = $command('../../template/iconfont.sql');
            _context6.next = 3;
            return _q2.default.nfcall(_fs2.default.readFile, sqlFile);

          case 3:
            content = _context6.sent;
            sqlList = content.toString().split(';').map(function (sql) {
              return sql.replace(/\n/g, '');
            }).filter(function (v) {
              return v;
            });
            _context6.next = 7;
            return sqlList.reduce(function (def, sql) {
              return def.then(function () {
                return seq.query(sql);
              });
            }, Promise.resolve());

          case 7:
            _utils.log.done('数据导入成功');

          case 8:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function importDBData(_x5) {
    return _ref8.apply(this, arguments);
  };
}();

var npmPreInstall = function () {
  var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
    var questions, _ref10, src, other, source, params, sourceMap, registry;

    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _utils.log.info('选择 npm 源或直接输入指定的源，如: https://registry.npm.taobao.org');
            questions = [{
              type: 'list',
              message: '选择 npm 安装源',
              name: 'src',
              choices: ['1) npm', '2) taobao', '3) other']
            }, {
              type: 'input',
              name: 'other',
              message: '请输入指定的 npm 源:',
              when: function when(answers) {
                return answers.src === '3) other';
              }
            }];
            _context7.next = 4;
            return _inquirer2.default.prompt(questions);

          case 4:
            _ref10 = _context7.sent;
            src = _ref10.src;
            other = _ref10.other;
            source = getChoiceItem(src);
            params = ['install', '--no-optional'];
            sourceMap = {
              npm: '',
              taobao: '--registry=https://registry.npm.taobao.org'
            };


            if (Object.keys(sourceMap).indexOf(source) !== -1) {
              sourceMap[source] && params.push(sourceMap[source]);
            } else {
              registry = other.trim();

              registry && params.push('--registry=' + registry);
            }

            _utils.log.dim('在 ' + $install('/src') + ' 路径下执行命令: npm ' + params.join(' ') + '...');

            _context7.next = 14;
            return new Promise(function (resolve, reject) {
              var ls = (0, _child_process.spawn)('npm', params, {
                cwd: $install('/src')
              });

              var num = 0;
              var log = [];
              var total = 37718;

              var bar = new _progress2.default('依赖安装中 [:bar] :percent :elapsed', {
                total: total,
                complete: _chalk2.default.cyan('='),
                incomplete: _chalk2.default.dim('='),
                width: 40
              });

              bar.tick(num);

              ls.stdout.on('data', function (data) {
                var ret = data.toString();
                num += ret.length;
                log.push('[INFO]  ' + ret);
                bar.tick(num);
              });

              ls.stderr.on('data', function (data) {
                var ret = data.toString();
                num += ret.length;
                log.push('[ERROR] ' + ret);
                bar.tick(num);
              });

              ls.on('close', function (code) {
                bar.tick(total);
                if (!code) {
                  resolve();
                } else {
                  _fs2.default.writeFileSync($install('/install.log'), log.join('\n'));
                  reject(new Error('npm 依赖安装失败，安装日志已记录到 ' + $install('/install.log')));
                }
              });
            });

          case 14:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function npmPreInstall() {
    return _ref9.apply(this, arguments);
  };
}();

var getInstallPath = function () {
  var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
    var _ref12, installPath, stat, dirContent;

    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _inquirer2.default.prompt({
              type: 'input',
              name: 'installPath',
              message: '请输入安装路径:',
              validate: function validate(value) {
                if (value) return true;
                return '安装路径不能为空';
              }
            });

          case 2:
            _ref12 = _context8.sent;
            installPath = _ref12.installPath;

            dir = mixDirPath(installPath.trim());

            _context8.prev = 5;
            _context8.next = 8;
            return _q2.default.nfcall(_fs2.default.access, dir, _fs2.default.F_OK);

          case 8:
            _context8.next = 13;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8['catch'](5);
            throw new Error($install('/') + ' 路径不存在');

          case 13:
            _context8.next = 15;
            return _q2.default.nfcall(_fs2.default.stat, dir);

          case 15:
            stat = _context8.sent;

            if (stat.isDirectory()) {
              _context8.next = 18;
              break;
            }

            throw new Error($install('/') + ' 必须是文件夹');

          case 18:
            _context8.next = 20;
            return _q2.default.nfcall(_child_process.exec, 'ls ' + $install('/'));

          case 20:
            dirContent = _context8.sent;

            if (!(dirContent.join('') !== '')) {
              _context8.next = 23;
              break;
            }

            throw new Error('请确保 ' + $install('/') + ' 文件夹为空');

          case 23:
            _utils.log.dim('正在 ' + $install('/') + ' 路径下初始化项目...');

          case 24:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined, [[5, 10]]);
  }));

  return function getInstallPath() {
    return _ref11.apply(this, arguments);
  };
}();

exports.default = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
  var config;
  return _regenerator2.default.wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return getInstallPath();

        case 3:
          _context9.next = 5;
          return copySource();

        case 5:
          config = getConfig($install('/logs/log'));
          _context9.next = 8;
          return getDBConfig(config);

        case 8:
          _context9.next = 10;
          return getLoginConfig(config);

        case 10:
          _context9.next = 12;
          return writeConfigFile(config);

        case 12:
          _context9.next = 14;
          return authDBConnection(config);

        case 14:
          _context9.next = 16;
          return npmPreInstall();

        case 16:

          _utils.log.done('项目初始化成功，可以前往 ' + $install('/src') + ' 目录下执行 ./start.sh 以 3000 端口启动服务');
          process.exit(0);
          _context9.next = 24;
          break;

        case 20:
          _context9.prev = 20;
          _context9.t0 = _context9['catch'](0);

          _utils.log.error(_context9.t0.message);
          process.exit(1);

        case 24:
        case 'end':
          return _context9.stop();
      }
    }
  }, _callee9, undefined, [[0, 20]]);
}));