'use strict';

const { createApp } = require('./src/app');

const app = createApp();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`TODO server running on port ${PORT}`);
});

module.exports = { app, server };
