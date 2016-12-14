import program from 'commander';
import { init } from './command';
import pkg from '../package.json';

program.version(pkg.version);

program
  .command('init')
  .description('初始化 yicon 项目，进行数据库、登录配置')
  .action(init);

program.parse(process.argv);

if (!program.args.length) program.help();
