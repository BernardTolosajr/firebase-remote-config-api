const google = require('googleapis');
const Service = require('egg').Service;
const axios = require('axios');
const async = require('async');
const fs = require('fs');
const util = require('util');
var _ = require('lodash');

const SCOPES = ['https://www.googleapis.com/auth/firebase.remoteconfig'];

const r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'Firebase'
});

class Firebase extends Service {
  async updateConfig(params) {
    console.log('here')
  }

  async getConfigs() {
    const token = await this._getAccessToken()
    const { url } = this.config.firebase

    return new Promise((resolve, reject) => {
      async.waterfall([
        function(callback) {
          axios({
            method: 'get',
            url: url,
            headers: {
              Authorization: 'Bearer ' + token,
            }
          }).then((response) => {
            r.table('configs').count().run().then((count) => {
              if (count) {
                r.table('configs').run().then((configs) => {
                  const id = configs[0].id;
                  r.table('configs').get(id).update(response.data).run().then((result) => {
                    callback(null, true)
                  })
                });
              } else {
                r.table('configs').insert(response.data).run().then((result) => {
                  callback(null, true)
                }).catch((error) => {
                  callback(null, false)
                });
              }
            });
          })
        },
        function (args, callback) {
          r.table('configs').run().then((result) => { const parameter = result[0].parameters;
            const c = Object.keys(parameter).map(key => {
              const obj = {};
              obj[key] = parameter[key]
              return obj
            });

            callback(null, c)
          })
        }
      ], function(err, result) {
        if (err) {
          reject(err)
          return
        }
        resolve(result)
      })
    });
  }

  async _getAccessToken() {
    const { scopes } = this.config.firebase
    return new Promise(function(resolve, reject) {
      const key = require('../config/service-account');
      const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        scopes,
        null
      );
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  }
}

module.exports = Firebase;
