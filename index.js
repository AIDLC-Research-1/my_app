'use strict';

const { createApp } = require('./src/app');
const config = require('./src/config');

const app = createApp({ config });

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`TODO server running on port ${config.port}`);
});

module.exports = { app, server };
