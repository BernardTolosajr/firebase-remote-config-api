'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/configs', controller.config.index);
  router.put('/configs', controller.config.update);
};
