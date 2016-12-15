import { spawn } from 'child_process';

export const sp = (cmd, params, cwd) => {
  log.dim(`在 ${cwd} 路径下执行命令: ${cmd} ${params.join(' ')}...`);
  return new Promise((resolve, reject) => {
    const s = spawn(cmd, params, { cwd });

    s.stdout.on('data', data => log.dim(data));
    s.stderr.on('data', err => log.dim(err));
    s.on('close', code => code ? reject() : resolve());
  })
};

export const log = {
  done: msg => console.log(chalk.green(`✓ ${msg}`)),
  error: err => console.log(chalk.red(`× ${err}`)),
  info: msg => console.log(chalk.blue(`△ ${msg}`)),
  dim: msg => console.log(chalk.dim(`◎ ${msg}`))
};
