// 恢复误删的用户项目关联关系表（userProjects）数据
// 临时决定放到 yicon-builder 中，故原有通过 then 的写法就不改成 async、await 了

import mysql from 'mysql';
import Q from 'q';

import {
  log,
  getDBConfig
} from './utils';

// 日志分析
function analyzeLog(type, logString) {
  const logTypes = {
    PROJECT_MEMBER_ADD: '@user 加入了项目',
    PROJECT_MEMBER_DEL: '@user 被管理员从项目中移除'
  };
  const regExp = /@[^@]+@/g;
  const logType = logTypes[type].match(/\w+[^\s]/g);
  const logArr = logString.match(regExp).map(v => v.replace(/@/g, ''));
  const logs = {};

  const key = logType[0];
  logs[key] = logArr.map((v) => JSON.parse(v)[key]);
  return logs;
}


export default async () => {
  // 获取数据库信息
  const config = await getDBConfig({});
  const model = config && config.model || {};
  const connection = mysql.createConnection({
    host     : model.host,
    user     : model.username,
    password : model.password,
    database : model.database
  });

  // 连接数据库
  connection.connect((err) => {
    if (err) {
      log.error('连接数据库失败！错误信息为: ' + err.message);
      process.exit(1);
    }
    log.done('成功连接数据库！');
  });

  // 查询数据
  function query(sql) {
    const deferred = Q.defer();
    connection.query(sql, (error, results) => {
      if (error) {
        deferred.reject(new Error(error));
      }
      deferred.resolve(results);
    });
    return deferred.promise;
  }

  // 插入数据
  function insert(sql, data) {
    const deferred = Q.defer();
    connection.query(sql, data, (error, results) => {
      if (error) {
        deferred.reject(new Error(error));
      }
      deferred.resolve(results);
    });
    return deferred.promise;
  }

  // 查询或新建
  function findOrCreate(projectId, userId) {
    return query('select * from userProjects where projectId = ' + projectId + ' and userId = ' + userId)
      .then((data) => {
        if (data.length) return;
        return insert('insert into userProjects SET ?', { projectId: projectId, userId: userId });
      });
  }

  const info = {};
  query('select * from users')
    .then((allUsers) => {
      // 根据用户信息获取每个用户负责的所有项目
      const promiseLists = allUsers.map((user) => query('select id, owner from projects where owner = ' + user.id));
      return Q.all(promiseLists);
    })
    .then((projects) => {
      info.responsible = info.responsible || {};
      let userId = null;
      projects.forEach((project) => {
        const projectIds = project.map((item) => {
          userId = item.owner;
          return item.id;
        });
        if (userId) {
          info.responsible[userId] = projectIds;
        }
      });
      // 根据日志获取用户参与的项目（包括加入项目、被踢出项目）
      return query('select * from logs where type like "PROJECT_MEMBER_%" and scope = "project"');
    })
    .then((logs) => {
      info.participant = info.participant || {};
      logs.forEach((log) => {
        const projectId = log.loggerId;
        const operation = log.operation;
        const type = log.type;
        info.participant[projectId] = info.participant[projectId] || [];
        if (type === 'PROJECT_MEMBER_ADD') {
          const data = analyzeLog(type, operation);
          let users = [];
          if (Array.isArray(data.user)) {
              users = data.user.map((user) => user.id);
          }
          info.participant[projectId] = info.participant[projectId].concat(users);
        } else if (type === 'PROJECT_MEMBER_DEL') {
          const data = analyzeLog(type, operation);
          Array.isArray(data.user) && data.user.forEach((user) => {
            const useId = user.id;
            const index = info.participant[projectId].indexOf(useId);
            // 删除已被踢出项目的人员
            if (index > -1) info.participant[projectId].splice(index, 1);
          });
        }
      });
    })
    .then(() => {
      // 处理用户负责的项目
      let responsiblePromise = [];
      Object.keys(info.responsible).forEach((userId) => {
        if (userId && info.responsible[userId] && info.responsible[userId].length) {
          responsiblePromise = info.responsible[userId].map((projectId) => findOrCreate(projectId, userId));
        }
      });
      return Q.all(responsiblePromise);
    })
    .then(() => {
      // 处理用户参与的项目
      let participantPromise = [];
      Object.keys(info.participant).forEach((projectId) => {
        if (projectId && info.participant[projectId] && info.participant[projectId].length) {
          participantPromise = info.participant[projectId].map((userId) => findOrCreate(projectId, userId));
        }
      });
      return Q.all(participantPromise);
    })
    .then(() => {
      log.done('成功恢复用户项目关联关系表数据');
      connection.end();
    })
    .catch((err) => {
      log.error(err.message);
      connection.end();
      process.exit(1);
    });
}
