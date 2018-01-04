module.exports = {
  use: [
    '@neutrinojs/airbnb',
    [
      '@neutrinojs/preact',
      {
        html: {
          title: 'safe-explorer'
        }
      }
    ],
    '@neutrinojs/jest'
  ]
};
