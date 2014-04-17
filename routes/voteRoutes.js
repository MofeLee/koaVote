/**
 * Module dependencies.
 */
var parse = require('co-body');
var render = require('../lib/render');
var config = require('../config')();

// Set up monk
var monk = require('monk');
var wrap = require('co-monk');
var db = monk(config.mongoUrl);
var votes = wrap(db.get('votes'));

// Route definitions
/**
 * Show creation form.
 */
module.exports.showAddVote = function *add() {
  this.body = yield render('new');
};

function existsAndNonEmpty(value){
  if(value === undefined)
    return false;
  if(value === null)
    return false;
  if(value === '')
    return false;
  return true;
};

/**
 * Store a vote.
 */
module.exports.addVote = function *create() {
  var vote = yield parse(this);

  // Validate
  if(!existsAndNonEmpty(vote.hospital)){
    this.set('ErrorMessage', 'Hospital required');
    this.redirect('/');
    return;
  }
  if(!existsAndNonEmpty(vote.voteValue)){
    this.set('ErrorMessage', 'Vote value required');
    this.redirect('/');
    return;
  }

  // Store it!
  vote.created_at = new Date;
  var v = yield votes.insert(vote);
  this.redirect('/vote/' + v._id + '/comment');
};

/**
 * Show thank you form, and add a comment
 */
module.exports.showAddComment = function *(id) {
  this.body = yield render('comment', { voteId : id });
};

/**
 * Adds a comment to vote
 */
module.exports.addComment = function *(id){
  var comment = yield parse(this);
  console.log(comment);
  console.log(id);
  this.status = 200;
};

/**
 * Export data
 * TODO: Move to own file?
 */
module.exports.exportTo = function *list(format) {
  var voteList = yield votes.find({});

  if (format === 'xls') {
    this.set('Content-Disposition', 'attachment;filename=data.xls');
    this.type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    this.body = yield render('list', { votes: voteList });
    return;
  }

  // default to json
  this.type = 'json';
  this.body = voteList;
};