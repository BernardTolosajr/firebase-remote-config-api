'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1527751678599_1213';

  // add your config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  }

  config.firebase = {
    projectId: 'lives-beta',
    host: 'https://firebaseremoteconfig.googleapis.com',
    path: '/v1/projects/lives-beta/remoteConfig',
    url: 'https://firebaseremoteconfig.googleapis.com/v1/projects/lives-beta/remoteConfig',
    scopes: ['https://www.googleapis.com/auth/firebase.remoteconfig'],
  }

  return config;
};
