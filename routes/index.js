var express = require('express');
var router = express.Router();

module.exports = function(db) {
  
  router.get('/:hash', function(req, res) {
    var hash = req.param('hash');

    var showStats = hash.indexOf('+') > 0;
    
    var id = hash;
    
    if(showStats) {
      id = hash.substring(0, hash.length -1);
    }
    
    console.log(id);
     
      db.get('SELECT * FROM urls WHERE rowid = $id', 
             { $id: id },
             function(err, record) {
               
               if (!record) {
                 res.send(404, 'Not Found');
                 return;
               }
               
               if (!showStats) {
                 db.run('INSERT INTO urlUsages (urlId, createdOn) VALUES ($urlId, $createdOn)',
                      {
                        $urlId: id,
                        $createdOn: (new Date()).toISOString()
                      },
                      function(err, row) {
                      });
                 
                 if (record.url.indexOf('htt') < 0) {
                   res.redirect('http://' + record.url);
                 }else {
                   res.redirect(record.url);
                 }
                 return;
               }
               
               var stats = [];
               
               db.each('SELECT * FROM urlUsages WHERE urlId = $id', 
                       { $id: id },
                       function(err,row) {
                         stats.push(row);
                         console.log(row);
                       },
                       function() {
                          res.render('shortened', {
                            record: record,
                            stats: stats
                          });
                       }
                      );
                       

              
             });
      
   
  });

  router.post('/', function(req, res) {
    
    var url = req.param('url');
    
    console.log(url);

    var id = null;
    
    db.run('INSERT INTO urls (url, createdOn) VALUES ($url, $createdOn)', 
           {
             $url: url,
             $createdOn: (new Date()).toISOString()
           },
           function(err, row) {
             if (err) {
               res.send(500, err.message);
               return;
             }
           
             var location = '/' +  this.lastID + '+';
             res.location(location);
             res.redirect(location);
           });
  });
  
  router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
    return;
  });


  return router;
};