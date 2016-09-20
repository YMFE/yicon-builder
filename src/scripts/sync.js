/* eslint-disable no-console */
import { exec } from 'child_process';
import path from 'path';

const localPath = path.join(__dirname, '../');
console.log(localPath);
const serverPath = 'l-iconfont1.h.dev.cn0:/home/q/www/yicon.corp.qunar.com/webapp';
const options = '-rzxvt --timeout=10 --chmod=\'a=rX,u+w\' --rsync-path=\'sudo rsync\'';
const syncCommand = `rsync ${options} ${localPath} ${serverPath}`;
console.log(syncCommand);

const sync = () => exec(syncCommand, { maxBuffer: 1024 * 1024 * 1024 }, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

// exec('npm run build', () => sync());
sync();
