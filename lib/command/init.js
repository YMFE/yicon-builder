var q = require('q');
var co = require('co');
var fs = require('fs');
var path = require('path');
var prompt = require('co-prompt');
var Sequelize = require('sequelize');
var exec = require('child_process').exec;
var config = require('../template/config');

function *readParam(description, defaultValue) {
  var value = yield prompt('请输入' + description + '(' + defaultValue + '): ');
  return value ? value : defaultValue;
}

module.exports = function() {
  return co(function *() {
    try {
      var dir = yield prompt('请输入安装路径(使用绝对路径): ');
      console.log('正在初始化项目...');
      yield q.nfcall(exec, 'cp -r ' + path.join(__dirname, '../../src/') + ' ' + path.join(dir, '/src'));
      yield q.nfcall(exec, 'mkdir ' + path.join(dir, '/resource'));
      yield q.nfcall(exec, 'mkdir ' + path.join(dir, '/logs'));
      yield q.nfcall(exec, 'cp ' + path.join(__dirname, '../../src/static/images/qiconbg.png') + ' ' + path.join(dir, '/resource/qiconbg.png'));

      console.log('done');
      console.log('\n输入数据库配置项，回车接受括号中的默认值');

      var host = yield readParam('数据库域名', '127.0.0.1');
      var user = yield readParam('数据库用户名', 'root');
      var pswd = yield readParam('数据库密码', '123456');
      var port = yield readParam('数据库端口号', '3306');
      var name = yield readParam('数据库名称', 'iconfont');

      config.model = {
        host: host,
        username: user,
        password: pswd,
        dialect: 'mysql',
        port: port,
        database: name
      };

      var configFile = path.join(dir, '/config.json');
      var content = JSON.stringify(config, null, 2);

      yield q.nfcall(fs.writeFile, configFile, content);
      console.log('您的数据库配置和日志配置如下，可以手工修改 ' + configFile + ' 来改变配置');
      console.log(content);

      var seq = new Sequelize(name, user, pswd, {
        port: port, host: host, logging: false,
        dialectOptions: { multipleStatements: true },
      });

      // 导入数据库数据
      try {
        yield seq.authenticate();
        console.log('数据库连接成功，准备导入数据...');
        var sqlFile = path.join(__dirname, '../template/iconfont.sql');
        var content = yield q.nfcall(fs.readFile, sqlFile);
        var sqlList = content.toString().split(';').map(function(sql) {
          return sql.replace(/\n/g, '');
        }).filter(function(v) { return v; });

        yield sqlList.reduce(function(def, sql) {
          return def.then(function() {
            return seq.query(sql);
          });
        }, Promise.resolve());
        console.log('导入数据成功');
      } catch (e) {
        console.log(e);
        console.log('连接数据库失败，请手工导入安装路径根目录下 sql 脚本建表');
        yield q.nfcall(exec, 'cp ' + path.join(__dirname, '../template/iconfont.sql') + ' ' + path.join(dir, '/iconfont.sql'));
      }

      process.exit(0);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  });
};
