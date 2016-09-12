var path = require('path');

module.exports = {
  log: {
    appenders: [
      {
        category: 'normal',
        type: 'dateFile',
        filename: path.join(__dirname, '../../logs/log');,
        alwaysIncludePattern: true,
        pattern: '-yyyy-MM-dd.log',
      },
    ],
  },
};