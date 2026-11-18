'use strict';

const fs = require('node:fs');
const path = require('node:path');

// 32 px 版本用于托盘。
const APP_ICON_PATH = path.join(__dirname, 'assets', 'app-icon.png');
const TRAY_ICON_DATA_URL = `data:image/png;base64,${fs.readFileSync(APP_ICON_PATH).toString('base64')}`;

module.exports = { APP_ICON_PATH, TRAY_ICON_DATA_URL };
