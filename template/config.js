import path from 'path';
import fs from 'fs';

const { CONFIG } = process.env;

let file = path.join(__dirname, '../../config.json');

if (CONFIG) {
  if (path.isAbsolute(CONFIG)) {
    file = CONFIG;
  } else {
    file = path.join(process.cwd(), CONFIG);
  }
}

const data = fs.readFileSync(file);

let config = {};

try {
  config = JSON.parse(data);
} catch (e) {
  throw new Error(e);
}

const common = {
  path: {
    caches: path.join(__dirname, '../../caches'),
    font: 'download/font',
    svg: 'download/svg',
    png: 'download/png',
  },
};

const configPool = config.production ? config : {
  // 生产环境
  production: {
    ...config,
  },

  // 开发环境
  development: {
    title: config.title,
    path: common.path,
    model: {
      ...config.model,
    },
    port: 3000,
    log: {
      appenders: [
        { category: 'normal', type: 'console' },
      ],
    },
    login: {
      ...config.login,
    },
    source: {
      ...config.source,
    },
  },
};

export default {
  ...common,
  ...configPool[process.env.NODE_ENV],
};
