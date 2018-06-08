
'use strict';

const Controller = require('egg').Controller;

class SessionController extends Controller {
  async create() {
    const params = this.ctx.request.body;
    const session = await this.ctx.service.user.signIn(params);
    this.ctx.body = session;
  }
}

module.exports = SessionController;
