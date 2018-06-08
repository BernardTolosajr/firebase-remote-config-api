const jwt = require('koa-jwt');

const r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'Firebase'
});

module.exports = app => {

  app.use(async function (ctx, next) {
      return next().catch((err) => {
            if (err.status === 401) {
                    ctx.status = 401;
                    let errMessage = err.originalError ?
                        err.originalError.message :
                        err.message
                    ctx.body = {
                              error: errMessage
                            };
                    ctx.set("X-Status-Reason", errMessage)
                  } else {
                          throw err;
                        }
          });
  });

  app.use(jwt({
    secret: 'shared-secret'
  }).unless({ path: [/^\/public/] }));

  app.beforeStart(async () => {
//    r.dbCreate('Firebase')
//    .run()
//    .then(function(response){
//        console.log(response);
//    })
//    .error(function(err){
//        console.log('error occured ', err);
//    });
//
    r.tableCreate('configs')
    .run()
    .then(function(response){
        console.log(response);
    })
    .error(function(err){
        console.log('error while creating table ', err);
    })

    r.tableCreate('users')
    .run()
    .then(function(response){
       console.log(response);
    })
    .error(function(err){
        console.log('error while creating table ', err);
    })
  });
}
