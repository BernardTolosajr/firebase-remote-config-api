const r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'Firebase'
});

module.exports = app => {
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
  });
}
