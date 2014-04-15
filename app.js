/**
 * Module dependencies.
 */

var logger = require('koa-logger');
var route = require('koa-route');
var serve = require('koa-static');
var koa = require('koa');
var app = module.exports = koa();

// middleware
app.use(logger());
app.use(serve(__dirname + '/public'));

// route middleware
var routes = require('./voteRoutes.js');
app.use(route.get('/', routes.add));
app.use(route.post('/vote', routes.create));
app.use(route.get('/vote/export/:format', routes.exportTo));

// listen
app.listen(3000);
console.log('listening on port 3000');