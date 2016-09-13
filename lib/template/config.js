module.exports = {
  log: {
    appenders: [
      {
        category: 'normal',
        type: 'dateFile',
        alwaysIncludePattern: true,
        pattern: '-yyyy-MM-dd.log',
      },
    ],
  },
};