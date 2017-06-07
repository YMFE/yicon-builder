import q from 'q';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Sequelize from 'sequelize';
import { exec } from 'child_process';

import {
  wget,
  log,
  npmPreInstall,
  buildProject,
  syncVersion
} from './utils';

const getConfig = filename => ({
  log: {
    appenders: [
      {
        category: 'normal',
        type: 'dateFile',
        filename,
        alwaysIncludePattern: true,
        pattern: '-yyyy-MM-dd.log',
      },
    ],
  },
});

let dir;

const getChoiceItem = item => item.replace(/^\d+\) /, '');

// 修复相对路径
const mixDirPath = dir => {
  const cwd = process.cwd();
  return /^\//.test(dir) ? dir : path.join(cwd, dir);
};

const $command = p => path.join(__dirname, p);
const $install = p => path.join(dir, p);

// 将 src 资源文件复制到指定目录
const copySource = async (branch) => {
  const sourceUrl = `YMFE/yicon#${branch}`;
  await q.nfcall(exec, `mkdir "${$install('/src')}"`);
  await wget(sourceUrl, $install('/src'));
  await q.nfcall(exec, `cp -r "${$install('/src')}" "${$install('.src_prev')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../template/config.js')}" "${$install('/src/src')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../template/start.sh')}" "${$install('/src')}"`);
  await q.nfcall(exec, `mkdir "${$install('/logs')}"`);

  log.done('项目初始化完成');
};

const getDBConfig = async (config, isDefault) => {
  if (isDefault) {
    config.model = {
      host: '127.0.0.1',
      username: 'root',
      password: '123456',
      port: '3306',
      database: 'iconfont',
      dialect: 'mysql'
    };
    return config;
  }
  log.info('输入数据库配置项，回车接受默认值');

  const questions = [
    {
      type: 'input',
      name: 'host',
      message: '请输入数据库域名或 IP 地址:',
      default: '127.0.0.1'
    },
    {
      type: 'input',
      name: 'username',
      message: '请输入数据库用户名:',
      default: 'root'
    },
    {
      type: 'input',
      name: 'password',
      message: '请输入数据库密码:',
      default: '123456'
    },
    {
      type: 'input',
      name: 'port',
      message: '请输入数据库端口号:',
      default: '3306'
    },
    {
      type: 'input',
      name: 'database',
      message: '请输入数据库名称:',
      default: 'iconfont'
    }
  ];

  config.model = await inquirer.prompt(questions);

  config.model.dialect = 'mysql';

  return config;
};

const getLoginConfig = async (config, isDefault) => {
  const ssoCasConfig = {
    authUrl: 'http://cas.example.com/cas/login?service={{service}}',
    tokenUrl: 'http://cas.example.com/serviceValidate?service={{service}}&ticket={{token}}',
    serviceUrl: 'http://app.iconfont.com',
    adminList: [],
  };
  const ldapConfig = {
    server: 'ldap://127.0.0.1:1389',
    bindDn: 'cn=root',
    baseDn: 'test',
    bindPassword: 'secret',
    searchDn: 'cn=root'
  };

  if (isDefault) {
    config.login = {};
    Object.assign(config.login, { ssoType: 'sso' }, ssoCasConfig);
    return config;
  }

  const questions = [
    {
      type: 'list',
      message: '选择登录类型',
      name: 'type',
      choices: ['1) sso', '2) cas', '3) ldap']
    }
  ];
  const { type } = await inquirer.prompt(questions);
  const ssoType = getChoiceItem(type);
  config.login = { ssoType };
  if (ssoType === 'ldap') {
    Object.assign(config.login, ldapConfig);
  } else {
    Object.assign(config.login, ssoCasConfig);
  }

  return config;
};

const getSourceConfig = async config => {
  config.source = {
    support: false,
    infoUrl: '',
    versionUrl: '',
    sourceUrl: '',
    cdn: ''
  };
  return config;
};

const writeConfigFile = async config => {
  const content = JSON.stringify(config, null, 2);
  const configFile = $install('/config.json');

  await q.nfcall(fs.writeFile, configFile, content);

  log.dim(`您的数据库配置和日志配置已写入，可以手工修改 ${chalk.yellow(configFile)} 来改变配置`);
};

const authDBConnection = async (config, isDefault) => {
  const { host, username, password, port, database } = config.model;
  const seq = new Sequelize(database, username, password, {
    port, host, logging: false, dialectOptions: { multipleStatements: true },
  });

  let initDB = false;

  try {
    await seq.authenticate();
    log.done('数据库连接成功');
    if (!isDefault) {
      const { init } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'init',
          message: '是否初始化数据库?',
          default: false
        }
      ]);
      initDB = init;
    } else {
      initDB = true;
    }

    if (initDB) {
      await importDBData(seq);
    }
  } catch (e) {
    log.error(`导入数据库失败，错误信息为：${e.message}`);
  }

  if (!initDB) {
    log.dim('如需初始化，请手工导入安装路径根目录下 sql 脚本建表');
    await q.nfcall(exec, `cp "${$command('../../template/iconfont.sql')}" "${$install('/iconfont.sql')}"`);
  }
};

const importDBData = async seq => {
  const sqlFile = $command('../../template/iconfont.sql');
  const content = await q.nfcall(fs.readFile, sqlFile);
  const sqlList = content.toString().split(';')
    .map(sql => sql.replace(/\n/g, ''))
    .filter(v => v);

  await sqlList.reduce(
    (def, sql) => def.then(() => seq.query(sql)),
    Promise.resolve()
  );
  log.done('数据导入成功');
};

const getInstallPath = async (isDefault) => {
  let _installPath = null;
  if (!isDefault) {
    const { installPath } = await inquirer.prompt({
      type: 'input',
      name: 'installPath',
      message: '请输入安装路径:',
      validate: function (value) {
        if (value) return true;
        return '安装路径不能为空';
      }
    });
    _installPath = installPath;
  } else {
    _installPath = '.';
  }
  dir = mixDirPath(_installPath.trim());

  try {
    await q.nfcall(fs.access, dir, fs.F_OK);
  } catch (err) {
    throw new Error(`${$install('/')} 路径不存在`);
  }

  const stat = await q.nfcall(fs.stat, dir);
  if (!stat.isDirectory()) {
    throw new Error(`${$install('/')} 必须是文件夹`);
  }
  const dirContent = await q.nfcall(exec, `ls ${$install('/')}`);
  if (dirContent.join('') !== '') {
    throw new Error(`请确保 ${$install('/')} 文件夹为空`)
  }

  log.dim(`正在 ${$install('/')} 路径下初始化项目...`);
};

export default async (args) => {
  try {
    const { branch = 'master' } = args;
    const isDefault = args && args.default;
    await getInstallPath(isDefault);
    await copySource(branch);

    const config = getConfig($install('/logs/log'));
    await getDBConfig(config, isDefault);
    await getLoginConfig(config, isDefault);
    await getSourceConfig(config);
    await writeConfigFile(config);

    await authDBConnection(config, isDefault);
    await npmPreInstall($install('/src'), $install('/install.log'), isDefault);
    await buildProject($install('/src'));
    syncVersion($install('/src'));

    log.done(`项目初始化成功，可以前往 ${$install('/src')} 目录下执行 ./start.sh 以 3000 端口启动服务`);
    process.exit(0);
  } catch (e) {
    log.error(e.message);
    process.exit(1);
  }
};
