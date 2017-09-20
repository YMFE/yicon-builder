// 执行各种查询、恢复数据等命令
import recoverUserProjects from './recoverUserProjects';
import { log } from './utils';

export default (cmd) => {
  try {
    if (typeof cmd !== 'string' || !cmd) {
      log.error('yicon run <cmd>, 缺少 cmd 参数');
    }
    switch (cmd) {
      // 恢复误删的用户项目关联关系表数据
      case 'recoverUserProjects': {
        recoverUserProjects();
        break;
      }
      default:
        log.warn(`${cmd} 命令尚不支持`);
    }
  } catch (e) {
    log.error(e.message);
    process.exit(1);
  }
}
