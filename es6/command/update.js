import q from 'q';
import fs from 'fs';
import path from 'path';
import walkSync from 'walk-sync';
import FSTree from 'fs-tree-diff';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { exec } from 'child_process';

import { wget, log, npmPreInstall, buildProject } from './utils';

const TYPE_MAP = {
  unlink: {color: 'red', text: '文件删除'},
  rmdir: {color: 'red', text: '目录删除'},
  mkdir: {color: 'green', text: '目录新增'},
  create: {color: 'green', text: '文件新增'},
  change: {color: 'cyan', text: '文件改动'}
};

async function validateProject(src) {
  try {
    const stat = await q.nfcall(fs.stat, src);
    if (!stat.isDirectory()) {
      throw new Error();
    }
  } catch (err) {
    throw new Error('当前目录下不存在 src 路径，请确保在 yicon 项目路径下运行此命令');
  }
}

export default async () => {
  try {
    const cwd = process.cwd();
    const src = path.join(cwd, 'src');
    const srcPrev = path.join(cwd, '.src_prev');

    await validateProject(src);
    log.dim('正在分析项目改动...');

    const prev = new FSTree({
      entries: walkSync.entries(srcPrev)
    });
    const next = new FSTree({
      entries: walkSync.entries(src, {
        ignore: [
          'static/dist',
          'src/config.js',
          'start.sh',
          'node_modules',
          'webpack-assets.json'
        ]
      })
    });

    const diff = prev.calculatePatch(next);

    const output = diff.map(data => {
      const [ type, filename ] = data;
      const { color, text } = TYPE_MAP[type];
      return chalk[color](`  [${text}] ${filename}`);
    });

    if (output.length) {
      log.info('检测到相比上次下载的版本，本地有如下改动：');
      console.log(output.join('\n'));
    }

    const { update } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'update',
        message: '是否覆盖更新资源目录?',
        default: false
      }
    ]);

    if (update) {
      await q.nfcall(exec, `rm -r ${src}`);
      await q.nfcall(exec, `rm -r ${srcPrev}`);
      await wget('YMFE/yicon#deploy', src);
      await q.nfcall(exec, `cp -r ${src} ${srcPrev}`);

      const pkg = await q.nfcall(fs.readFile, path.join(src, 'package.json'), 'utf8');
      const version = JSON.parse(pkg).version;

      await npmPreInstall(src, path.join(cwd, 'install.log'));
      await buildProject(src);

      log.info(`项目更新成功！当前版本为 ${version}`);
    }
  } catch (e) {
    process.exit(1);
    log.error(e.message);
  }
}
