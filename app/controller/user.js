'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async create() {
    const params = this.ctx.request.body;
    const user = await this.ctx.service.user.create(params);
    this.ctx.body = user;
  }

}

module.exports = UserController;

