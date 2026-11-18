'use strict';

const { name, productName } = require('../package.json');

module.exports = Object.freeze({
  APP_NAME: productName,
  APP_ID: 'com.ailuo.gptplus.public',
  DATA_DIR_NAME: `.${name}`,
  UPDATER_CACHE_DIR: `${name}-updater`,
  RELEASE_OWNER: 'ailuo04',
  RELEASE_REPO: 'F-AI-Tool',
  DEFAULT_GATEWAY_PORT: 18121,
});
