import chalk from 'chalk';
import download from 'download';
import BottomBar from 'inquirer/lib/ui/bottom-bar';

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
