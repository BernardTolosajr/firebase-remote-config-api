'use strict';

const Controller = require('egg').Controller;

class ConfigController extends Controller {
  async index() {
    const configs = await this.ctx.service.firebase.getConfigs();
    this.ctx.body = configs;
  }

  async update() {
    const params = this.ctx.request.body;
    const response = await this.ctx.service.firebase.updateConfig(params)
    this.ctx.body = response
  }
}

module.exports = ConfigController;
