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

var _prompt = require('./prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _child_process = require('child_process');

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

// 公共用户交互
var readParam = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(description, defaultValue) {
    var value;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _prompt2.default)('  ' + _chalk2.default.yellow('⇒') + ' ' + _chalk2.default.bold(description) + '(' + defaultValue + '): ');

          case 2:
            value = _context.sent;
            return _context.abrupt('return', value || defaultValue);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function readParam(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

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

var log = {
  done: function done(msg) {
    return console.log(_chalk2.default.green('√ ' + msg));
  },
  error: function error(err) {
    return console.log(_chalk2.default.bgRed('ERROR'), err);
  },
  info: function info(msg) {
    return console.log(_chalk2.default.yellow.underline(msg));
  }
};

// 将 src 资源文件复制到指定目录
var copySource = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../src/') + '" "' + $install('/src') + '"');

          case 2:
            _context2.next = 4;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../src/.babelrc') + '" "' + $install('/src') + '"');

          case 4:
            _context2.next = 6;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../src/.npmrc') + '" "' + $install('/src') + '"');

          case 6:
            _context2.next = 8;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../template/config.js') + '" "' + $install('/src/src') + '"');

          case 8:
            _context2.next = 10;
            return _q2.default.nfcall(_child_process.exec, 'cp -r "' + $command('../../template/start.sh') + '" "' + $install('/src') + '"');

          case 10:
            _context2.next = 12;
            return _q2.default.nfcall(_child_process.exec, 'mkdir "' + $install('/logs') + '"');

          case 12:

            log.done('项目初始化完成');

          case 13:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function copySource() {
    return _ref2.apply(this, arguments);
  };
}();

var getDBConfig = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(config) {
    var host, user, pswd, port, name;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            log.info('输入数据库配置项，回车接受括号中的默认值');

            _context3.next = 3;
            return readParam('数据库域名', '127.0.0.1');

          case 3:
            host = _context3.sent;
            _context3.next = 6;
            return readParam('数据库用户名', 'root');

          case 6:
            user = _context3.sent;
            _context3.next = 9;
            return readParam('数据库密码', '123456');

          case 9:
            pswd = _context3.sent;
            _context3.next = 12;
            return readParam('数据库端口号', '3306');

          case 12:
            port = _context3.sent;
            _context3.next = 15;
            return readParam('数据库名称', 'iconfont');

          case 15:
            name = _context3.sent;


            config.model = {
              host: host,
              username: user,
              password: pswd,
              dialect: 'mysql',
              port: port,
              database: name
            };

            return _context3.abrupt('return', config);

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getDBConfig(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getLoginConfig = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(config) {
    var type;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return readParam('登录类型【sso/cas】', 'cas');

          case 2:
            type = _context4.sent;


            config.login = {
              type: type,
              authUrl: 'http://cas.example.com/cas/login?service={{service}}',
              tokenUrl: 'http://cas.example.com/serviceValidate?service={{service}}&ticket={{token}}',
              serviceUrl: 'http://app.iconfont.com',
              adminList: []
            };

            return _context4.abrupt('return', config);

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getLoginConfig(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

var writeConfigFile = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(config) {
    var content, configFile;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            content = JSON.stringify(config, null, 2);
            configFile = $install('/config.json');
            _context5.next = 4;
            return _q2.default.nfcall(_fs2.default.writeFile, configFile, content);

          case 4:

            console.log('您的数据库配置和日志配置如下，可以手工修改 ' + _chalk2.default.yellow(configFile) + ' 来改变配置');
            console.log(content);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function writeConfigFile(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

var authDBConnection = function () {
  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(config) {
    var _config$model, host, username, password, port, database, seq, initDB, init;

    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
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
            _context6.prev = 8;
            _context6.next = 11;
            return seq.authenticate();

          case 11:
            log.done('数据库连接成功');
            _context6.next = 14;
            return readParam('是否初始化数据库？【y/n】', 'n');

          case 14:
            init = _context6.sent;

            initDB = init === 'y' || init === 'yes';

            if (!initDB) {
              _context6.next = 19;
              break;
            }

            _context6.next = 19;
            return importDBData(seq);

          case 19:
            _context6.next = 25;
            break;

          case 21:
            _context6.prev = 21;
            _context6.t0 = _context6['catch'](8);

            console.log(_chalk2.default.red('导入数据库失败，错误信息为：'));
            log.error(_context6.t0);

          case 25:
            if (initDB) {
              _context6.next = 29;
              break;
            }

            console.log(_chalk2.default.dim('如需初始化，请手工导入安装路径根目录下 sql 脚本建表'));
            _context6.next = 29;
            return _q2.default.nfcall(_child_process.exec, 'cp "' + $command('../../template/iconfont.sql') + '" "' + $install('/iconfont.sql') + '"');

          case 29:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[8, 21]]);
  }));

  return function authDBConnection(_x6) {
    return _ref6.apply(this, arguments);
  };
}();

var importDBData = function () {
  var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(seq) {
    var sqlFile, content, sqlList;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            sqlFile = $command('../../template/iconfont.sql');
            _context7.next = 3;
            return _q2.default.nfcall(_fs2.default.readFile, sqlFile);

          case 3:
            content = _context7.sent;
            sqlList = content.toString().split(';').map(function (sql) {
              return sql.replace(/\n/g, '');
            }).filter(function (v) {
              return v;
            });
            _context7.next = 7;
            return sqlList.reduce(function (def, sql) {
              return def.then(function () {
                return seq.query(sql);
              });
            }, Promise.resolve());

          case 7:
            console.log(_chalk2.default.green('数据导入成功'));

          case 8:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function importDBData(_x7) {
    return _ref7.apply(this, arguments);
  };
}();

var npmPreInstall = function () {
  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
    var source, params, sourceMap, registry;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            log.info('选择 npm 源或直接输入指定的源，如：https://registry.npm.taobao.org');
            _context8.next = 3;
            return readParam('npm 安装源【npm/taobao/qnpm】', 'taobao');

          case 3:
            source = _context8.sent;
            params = ['install'];
            sourceMap = {
              npm: '',
              taobao: '--registry=https://registry.npm.taobao.org',
              qnpm: '--registry=http://registry.npm.corp.qunar.com'
            };


            if (Object.keys(sourceMap).indexOf(source) !== -1) {
              sourceMap[source] && params.push(sourceMap[source]);
            } else {
              registry = source.trim();

              registry && params.push('--registry=' + registry);
            }

            console.log(_chalk2.default.dim('在 ' + $install('/src') + ' 路径下执行命令：npm ' + params.join(' ') + '...'));

            _context8.next = 10;
            return new Promise(function (resolve, reject) {
              var ls = (0, _child_process.spawn)('npm', params, {
                cwd: $install('/src')
              });

              ls.stdout.on('data', function (data) {
                console.log(data.toString());
              });

              ls.stderr.on('data', function (data) {
                console.log(data.toString());
              });

              ls.on('close', function (code) {
                !code ? resolve() : reject();
              });
            });

          case 10:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function npmPreInstall() {
    return _ref8.apply(this, arguments);
  };
}();

exports.default = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
  var installPath, config;
  return _regenerator2.default.wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return (0, _prompt2.default)('请输入安装路径: ');

        case 3:
          installPath = _context9.sent;

          dir = mixDirPath(installPath);
          console.log(_chalk2.default.dim('正在路径 ' + dir + ' 中初始化项目...'));

          _context9.next = 8;
          return copySource();

        case 8:
          config = getConfig($install('/logs/log'));
          _context9.next = 11;
          return getDBConfig(config);

        case 11:
          _context9.next = 13;
          return getLoginConfig(config);

        case 13:
          _context9.next = 15;
          return writeConfigFile(config);

        case 15:
          _context9.next = 17;
          return authDBConnection(config);

        case 17:
          _context9.next = 19;
          return npmPreInstall();

        case 19:

          log.done('项目初始化成功，可以去 ' + $install('/src') + ' 目录下执行 ./start.sh 以 3000 端口启动服务');
          process.exit(0);
          _context9.next = 27;
          break;

        case 23:
          _context9.prev = 23;
          _context9.t0 = _context9['catch'](0);

          log.error(_context9.t0);
          process.exit(1);

        case 27:
        case 'end':
          return _context9.stop();
      }
    }
  }, _callee9, undefined, [[0, 23]]);
}));