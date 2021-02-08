// global variables
let db      = require('../models/dbConfig');
let logger  = require('../models/winstonConfig')

module.exports.index = (req, res) => {
  var getComments = 'SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 25;'
  db.query(getComments, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (index) could not getComments',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    res.render("user/journal/comment/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' }
      }
    )
  })
}

module.exports.indexInfinite = (req, res) => {
  var getComments = 'SELECT *, 1 AS type FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 25 OFFSET ?;'
  if (req.body.query) { getComments = req.body.query + ' OFFSET ?;'}
  queryVariables = []
  var usersRequired = (getComments.match(/\?/g) || []).length
  queryVariables = queryVariables.concat(Array(usersRequired - 1).fill(req.user.id));
  queryVariables.push(Number(req.body.offset))
  db.query(getComments, queryVariables, (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (index) could not INFINITE SCROLL getComments',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      lastUpdate: res.__('Last Update'),
      btnEntry: res.__('Go to Entry'),
      btnTa: res.__('Go to TA'),
    })
  })
}

module.exports.filter = (req, res) => {
  var createFilter = ''
  var editFilter = ''
  var addEntries = ''
  var addTA = ''
  if (req.body.entries) { addEntries = 'UNION SELECT e.id, pair, entry_dt AS created_at, 2 AS type, comment, NULL AS last_update FROM entries e JOIN pairs p ON p.id = e.pair_id WHERE e.user_id = ?' }
  if (req.body.ta) { addTA = 'UNION SELECT ta.id, pair, created_at, 3 AS type, NULL AS comment, last_update FROM tanalysis ta JOIN pairs p ON ta.pair_id = p.id WHERE ta.user_id = ?' }
  if (req.body.create) { createFilter = '&& created_at >= ' + req.body.create + ' >= created_at' }
  if (req.body.edit) { editFilter = '&& last_update >= ' + req.body.edit + ' >= last_update' }
  var getAllContent = `SELECT id, NULL AS pair, created_at, 1 AS type, comment, last_update FROM comments
    WHERE user_id = ? ${editFilter} ${createFilter}
    ${addEntries}
    ${addTA}
    ORDER BY created_at ${req.body.order} LIMIT 25`
  db.query(getAllContent, [req.user.id, req.user.id, req.user.id], (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (index) could not FILTER getAllComments',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      lastUpdate: res.__('Last Update'),
      btnEntry: res.__('Got to Entry'),
      btnTa: res.__('Go to TA'),
      query: getAllContent
    })
  })
}

module.exports.renderNewForm = (req, res) => {
  res.render("user/journal/comment/new")
}

module.exports.createComment = (req, res) => {
  var commentQuery = 'INSERT INTO comments SET ?';
  // create object w/ comment info
  var newcomment = {
    user_id: req.user.id,
    comment: req.body.comment
  }
  // save comment to the DB
  db.query(commentQuery, newcomment, (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (new) could not insertComment',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment/new');
    }
    req.flash('success', res.__('Comment was created successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  });
}

module.exports.showComment = (req, res) => {
  var getComment = 'SELECT id, created_at, comment FROM comments WHERE id = ?';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  db.query(getComment, req.params.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (show) could not getComment',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at.toLocaleDateString(req.user.language, options),
      comment: results[0].comment
    }
    res.render('user/journal/comment/show', {comment:commentInfo});
  })
}

module.exports.renderEditForm = (req, res) => {
  var getComment = 'SELECT id, created_at, comment FROM comments WHERE id = ?';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  db.query(getComment, req.params.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (edit) could not getComments',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at.toLocaleDateString(req.user.language, options),
      comment: results[0].comment
    }
    res.render('user/journal/comment/edit', {comment:commentInfo});
  })
}

module.exports.updateComment = (req, res) => {
  console.log("Data: " + req.body.comment);
  var commentbody = {
    created_at: new Date(),
    comment: req.body.comment
  }
  db.query('UPDATE comments SET ? WHERE id = ?', [commentbody, req.params.id], (err, updated) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (edit) could not updateComment',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    console.log('changed ' + updated.changedRows + ' rows');
    req.flash('success', res.__('Comment was updated successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  })
}

module.exports.deleteComment = (req, res) => {
  var commentToDelete = req.params.id
  var deleteQuery = 'DELETE FROM comments WHERE id = ?'
  // Query to delte the entry
  db.query(deleteQuery, commentToDelete, (err) => {
    if (err) {
      logger.error({
        message: 'COMMENTS (delete) could not deleteComment',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    req.flash('success', res.__('Comment was deleted successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  })
}
