import program from 'commander';
import { init } from './command';

program.version('1.0.0');

program
  .command('init')
  .description('初始化 yicon 项目，进行数据库、登录配置')
  .action(init);

program
  .command('start')
  .description('启动 yicon 项目')
  .action();

program.parse(process.argv);
