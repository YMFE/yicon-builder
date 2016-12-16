import fs from 'fs';
import chalk from 'chalk';
import download from 'download';
import BottomBar from 'inquirer/lib/ui/bottom-bar';
import ProgressBar from 'progress';
import inquirer from 'inquirer';
import { spawn } from 'child_process';

export function wget(repo, dest) {
  const url = github(normalize(repo));
  const cmd = download(url, dest, { extract: true, strip: 1 });
  cmd.stdout = process.stdout;
  return loadingSpawn(cmd, '资源获取');
}

function github(repo) {
  const { owner, name, branch } = repo;
  return `https://github.com/${owner}/${name}/archive/${branch}.zip`;
}

function normalize(string) {
  const owner = string.split('/')[0];
  let name = string.split('/')[1];
  let branch = 'master';

  if (~name.indexOf('#')) {
    branch = name.split('#')[1];
    name = name.split('#')[0];
  }

  return { owner, name, branch };
}

export function loadingSpawn(cmd, info) {
  return new Promise((resolve, reject) => {
    let i = 0;
    const loader = [
      '\u2807', '\u280B', '\u2819', '\u2838', '\u2834', '\u2826'
    ].map(v => `${v} ${info}中...`);
    const ui = new BottomBar({ bottomBar: loader[i] });
    const clearId = setInterval(() => ui.updateBottomBar(loader[i++ % 6]), 300);

    ui.log.pipe(cmd.stdout);

    function finished(code) {
      clearInterval(clearId);
      if (code) {
        reject(new Error(`${info}出现异常`));
        return;
      } else {
        resolve();
        ui.updateBottomBar(chalk.green(`✓ ${info}成功!\n`));
      }
      // 做好清理
      // ui.log.unpipe(cmd.stdout);
      ui.close();
    }

    if (typeof cmd.then === 'function') {
      cmd
        .then(() => finished.call(null, 0))
        .catch(e => finished.call(null, 1));
    } else {
      cmd.on('close', finished);
    }
  });
}

export const log = {
  done: msg => console.log(chalk.green(`✓ ${msg}`)),
  error: err => console.log(chalk.red(`× ${err}`)),
  info: msg => console.log(chalk.blue(`△ ${msg}`)),
  dim: msg => console.log(chalk.dim(`◎ ${msg}`))
};

const getChoiceItem = item => item.replace(/^\d+\) /, '');

export const npmPreInstall = async (targetPath, logPath) => {
  log.info('选择 npm 源或直接输入指定的源，如: https://registry.npm.taobao.org');
  const questions = [
    {
      type: 'list',
      message: '选择 npm 安装源',
      name: 'src',
      choices: ['1) npm', '2) taobao', '3) other']
    },
    {
      type: 'input',
      name: 'other',
      message: '请输入指定的 npm 源:',
      when: function (answers) {
        return answers.src === '3) other';
      }
    },
  ];
  const { src, other } = await inquirer.prompt(questions);
  const source = getChoiceItem(src);
  const params = ['install', '--no-optional'];

  const sourceMap = {
    npm: '',
    taobao: '--registry=https://registry.npm.taobao.org'
  };

  if (Object.keys(sourceMap).indexOf(source) !== -1) {
    sourceMap[source] && params.push(sourceMap[source]);
  } else {
    const registry = other.trim();
    registry && params.push(`--registry=${registry}`);
  }

  log.dim(`在 ${targetPath} 路径下执行命令: npm ${params.join(' ')}`);

  await new Promise((resolve, reject) => {
    const ls = spawn('npm', params, {
      cwd: targetPath,
    });

    let num = 0;
    const log = [];
    const total = 37718;

    const bar = new ProgressBar('依赖安装中 [:bar] :percent', {
      total,
      complete: chalk.cyan('='),
      incomplete: chalk.dim('='),
      width: 40
    });

    bar.tick(num);

    ls.stdout.on('data', (data) => {
      const ret = data.toString();
      num += ret.length;
      log.push('[INFO]  ' + ret);
      if (num <= total) bar.tick(ret.length);
    });

    ls.stderr.on('data', (data) => {
      let ret = data.toString();
      num += ret.length;
      log.push('[ERROR] ' + ret);
      if (num <= total) bar.tick(ret.length);
    });

    ls.on('close', (code) => {
      const gap = total - num;
      if (gap > 0) bar.tick(gap);
      if (!code) {
        resolve()
      } else {
        fs.writeFileSync(logPath, log.join('\n'));
        reject(new Error(`npm 依赖安装失败，安装日志已记录到 ${logPath}`));
      }
    });
  });
};

export const buildProject = async (targetPath) => {
  const cmd = spawn('npm', ['run', 'build'], { cwd: targetPath });
  await loadingSpawn(cmd, '构建项目');
};
