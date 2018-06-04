const google = require('googleapis');
const Service = require('egg').Service;
const axios = require('axios');
const async = require('async');
const fs = require('fs');
const util = require('util');
var _ = require('lodash');

const r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'Firebase'
});

class Firebase extends Service {
  async updateConfig(params) {
    const token = await this._getAccessToken()
    const { url } = this.config.firebase

    async.waterfall([
      function(callback) {
        const data = r.table('configs').run().then((result) => {
          const { id } = result[0]
          callback(null, id)
        })
      },
      function(id, callback) {
        const { parameters } = params
        r.table('configs').get(id).update({ parameters }).run().then((result) => {
          callback(null, id)
        })
      },
      function(id, callback) {
        r.table('configs').get(id).run().then((result) => {
          callback(null, result)
        })
      },
      function(config, callback) {
        const { id, etag, parameters } = config
        axios({
          method: 'put',
          url: url,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json; UTF-8',
            'Accept-Encoding': 'gzip',
            'If-Match': etag
          },
          data: { parameters }
        }).then((response) => {
          if (response.status === 200) {
            const etag = response.headers['etag']
            // update new etag
            r.table('configs').get(id).update({ etag }).run().then((result) => {
              callback(null, true)
            })
          } else {
            callback(null, false)
          }
        })
      }
    ], function(err, result) {
      if (err) {
        console.log(err)
        return
      }
      console.log('success')
    });
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
              'Accept-Encoding': 'gzip'
            }
          }).then((response) => {
            const etag = response.headers['etag']
            const { parameters } = response.data

            const data = {
              etag: etag,
              parameters,
            }

            r.table('configs').count().run().then((count) => {
              if (count) {
                r.table('configs').run().then((configs) => {
                  const id = configs[0].id;
                  r.table('configs').get(id).update(data).run().then((result) => {
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
