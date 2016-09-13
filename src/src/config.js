import path from 'path';
import fs from 'fs';
const dbLog = fs.readFileSync('../../config');
const logPath = path.join(__dirname, '../../logs/log');

const common = {
  path: {
    caches: '../caches',
    font: 'download/font',
    svg: 'download/svg',
    png: 'download/png',
  },
};

let data = {};

try {
  data = JSON.parse(dbLog);
} catch (e) {}

const env = {
  // 线上机器
  production: {
    ...data,
  },
};

const config = env[process.env.NODE_ENV];

export default { ...common, ...config };
