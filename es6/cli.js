import program from 'commander';
import { init, update, run } from './command';
import pkg from '../package.json';

program.version(pkg.version);

program
  .command('init')
  // .arguments('[branch]')
  .option('-d, --default', '默认配置')
  .option('-b, --branch <branch>', '指定 yicon 初始化分支或tag')
  .description('初始化 yicon 项目，进行数据库、登录配置')
  .action(init);

program
  .command('update')
  .description('更新 yicon 项目，对比差异应用更新')
  .action(update);

program
  .command('run')
  .usage('<cmd>')
  .arguments('cmd')
  .description('查询、恢复数据等')
  .action(run);

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
