const Service = require('egg').Service;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'Firebase'
});

class User extends Service {
  async create(params) {
    const { password, username } = params;

    const hashPassword = await bcrypt.hash(password, 5);

    const user = r.table('users').insert({
      password: hashPassword,
      username
    }).run();

    return user
  }

  async signIn(params) {
    const { username, password } = params

    const users = await r.table('users').filter({
      username
    }).run()

    if (users.length === 0) {
      return {
        error: 'not found'
      }
    }

    const {
      password: hashPassword,
      ...withoutPassword
    } = users[0];

    if (await bcrypt.compare(password, hashPassword)) {
      return {
        token: jwt.sign({
          data: withoutPassword
        }, 'shared-secret')
      }
    }

    return {
      error: 'bad password'
    }
  }
}

module.exports = User;
