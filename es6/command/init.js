import q from 'q';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompt from './prompt';
import Sequelize from 'sequelize';
import { exec, spawn } from 'child_process';

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

// 公共用户交互
const readParam = async (description, defaultValue) => {
  const value = await prompt(`  ${chalk.yellow('⇒')} ${chalk.bold(description)}(${defaultValue}): `);
  return value || defaultValue;
};

// 修复相对路径
const mixDirPath = dir => {
  const cwd = process.cwd();
  return /^\//.test(dir) ? dir : path.join(cwd, dir);
};

const $command = p => path.join(__dirname, p);
const $install = p => path.join(dir, p);

const log = {
  done: msg => console.log(chalk.green(`√ ${msg}`)),
  error: err => console.log(chalk.bgRed('ERROR'), err),
  info: msg => console.log(chalk.yellow.underline(msg))
};

// 将 src 资源文件复制到指定目录
const copySource = async () => {
  await q.nfcall(exec, `cp -r "${$command('../../src/')}" "${$install('/src')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../src/.babelrc')}" "${$install('/src')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../src/.npmrc')}" "${$install('/src')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../template/config.js')}" "${$install('/src/src')}"`);
  await q.nfcall(exec, `cp -r "${$command('../../template/start.sh')}" "${$install('/src')}"`);
  await q.nfcall(exec, `mkdir "${$install('/logs')}"`);

  log.done('项目初始化完成');
};

const getDBConfig = async config => {
  log.info('输入数据库配置项，回车接受括号中的默认值');

  const host = await readParam('数据库域名', '127.0.0.1');
  const user = await readParam('数据库用户名', 'root');
  const pswd = await readParam('数据库密码', '123456');
  const port = await readParam('数据库端口号', '3306');
  const name = await readParam('数据库名称', 'iconfont');

  config.model = {
    host,
    username: user,
    password: pswd,
    dialect: 'mysql',
    port,
    database: name
  };

  return config;
};

const getLoginConfig = async config => {
  const type = await readParam('登录类型【sso/cas】', 'cas');

  config.login = {
    type,
    authUrl: 'http://cas.example.com/cas/login?service={{service}}',
    tokenUrl: 'http://cas.example.com/serviceValidate?service={{service}}&ticket={{token}}',
    serviceUrl: 'http://app.iconfont.com',
    adminList: [],
  };

  return config;
};

const writeConfigFile = async config => {
  const content = JSON.stringify(config, null, 2);
  const configFile = $install('/config.json');

  await q.nfcall(fs.writeFile, configFile, content);

  console.log(`您的数据库配置和日志配置如下，可以手工修改 ${chalk.yellow(configFile)} 来改变配置`);
  console.log(content);
};

const authDBConnection = async config => {
  const { host, username, password, port, database } = config.model;
  const seq = new Sequelize(database, username, password, {
    port, host, logging: false, dialectOptions: { multipleStatements: true },
  });

  let initDB = false;

  try {
    await seq.authenticate();
    log.done('数据库连接成功');
    const init = await readParam('是否初始化数据库？【y/n】', 'n');
    initDB = init === 'y' || init === 'yes';
    if (initDB) {
      await importDBData(seq);
    }
  } catch (e) {
    console.log(chalk.red('导入数据库失败，错误信息为：'));
    log.error(e);
  }

  if (!initDB) {
    console.log(chalk.dim('如需初始化，请手工导入安装路径根目录下 sql 脚本建表'));
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
  console.log(chalk.green('数据导入成功'));
};

const npmPreInstall = async () => {
  log.info('选择 npm 源或直接输入指定的源，如：https://registry.npm.taobao.org');
  const source = await readParam('npm 安装源【npm/taobao/qnpm】', 'taobao');
  const params = ['install'];

  const sourceMap = {
    npm: '',
    taobao: '--registry=https://registry.npm.taobao.org',
    qnpm: '--registry=http://registry.npm.corp.qunar.com'
  };

  if (Object.keys(sourceMap).indexOf(source) !== -1) {
    sourceMap[source] && params.push(sourceMap[source]);
  } else {
    const registry = source.trim();
    registry && params.push(`--registry=${registry}`);
  }

  console.log(chalk.dim(`在 ${$install('/src')} 路径下执行命令：npm ${params.join(' ')}...`));

  await new Promise((resolve, reject) => {
    const ls = spawn('npm', params, {
      cwd: $install('/src'),
    });

    ls.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    ls.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    ls.on('close', (code) => {
      !code ? resolve() : reject();
    });
  });
};

export default async () => {
  try {
    const installPath = await prompt('请输入安装路径: ');
    dir = mixDirPath(installPath);
    console.log(chalk.dim(正在初始化项目...'));

    await copySource();

    const config = getConfig($install('/logs/log'));
    await getDBConfig(config);
    await getLoginConfig(config);
    await writeConfigFile(config);

    await authDBConnection(config);
    await npmPreInstall();

    log.done(`项目初始化成功，可以去 ${$install('/src')} 目录下执行 ./start.sh 以 3000 端口启动服务`);
    process.exit(0);
  } catch (e) {
    log.error(e);
    process.exit(1);
  }
};
