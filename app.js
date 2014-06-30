var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sqlite = require('sqlite3').verbose();

var db = new sqlite.Database('shorten.db');

function initTable(db, tableName, schema) {
 db.get("SELECT count(*) as rowCount FROM sqlite_master WHERE type='table' AND name = $tableName",
        {
          $tableName: tableName
        },
        function(err, row) {
          if(row && row.rowCount === 0) {
            db.run('CREATE TABLE ' + tableName + ' (' + schema + ')');
          }
        });
}

if (db) {
 db.serialize(function() {
  initTable(db,"urls","url TEXT, createdOn TEXT");
  initTable(db,"urlUsages","urlId INTEGER, createdOn TEXT");
 }); 
}


var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes(db));
//app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
