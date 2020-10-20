let express = require('express');
let router = express.Router({mergeParams: true});
let middleware = require('../middleware');
let db = require('../models/dbConfig');

// INDEX COMMENTS ROUTE
// FIXME: How to optmize when loading a large sample (LOAD AS YOU GO)
router.get("/", middleware.isLoggedIn, (req, res) => {
  var getAllComments = 'SELECT id, DATE_FORMAT(created_at, \'%Y-%m-%dT%H:%i:%s\') AS date, comment FROM comments WHERE user_id = ?';
  var getAllEntries = 'SELECT entries.id, DATE_FORMAT(entry_dt, \'%Y-%m-%dT%H:%i:%s\') AS date, comment, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ?';
  var getAllTas = 'SELECT tanalysis.id, DATE_FORMAT(created_at, \'%Y-%m-%dT%H:%i:%s\') AS date, pair FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ?';
  var dataList = []
  // the classification types are: 1-commment, 2-entry, 3-ta
  db.query(getAllComments, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    results.forEach((result) => {
      var comment = {
        id: result.id,
        date: new Date(result.date),
        type: 1,
        content: result.comment
      }
      dataList.push(comment);
    });
    db.query(getAllEntries, req.user.id, (err, results) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username);
      }
      results.forEach((result) => {
        var entry = {
          id: result.id,
          pair: result.pair,
          date: new Date(result.date),
          type: 2,
          content: result.comment
        }
        dataList.push(entry);
      });
      db.query(getAllTas, req.user.id, (err, results) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username);
        }
        results.forEach((result) => {
          var ta = {
            id: result.id,
            pair: result.pair,
            date: new Date(result.date),
            type: 3
          }
          dataList.push(ta);
        });
        dataList.sort((a, b) => a.date.getTime() - b.date.getTime());
        res.render("user/journal/comment/index", {dataList: dataList})

      })
    })
  })
})

// NEW COMMNET ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("user/journal/comment/new")
})

// NEW COMMENT LOGIC
router.post("/", middleware.isLoggedIn, (req, res) => {
  var commentQuery = 'INSERT INTO comments SET ?';
  // create object w/ comment info
  var newcomment = {
    user_id: req.user.id,
    comment: req.body.comment
  }
  // save comment to the DB
  db.query(commentQuery, newcomment, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment/new');
    }
    req.flash('success', res.__('Comment was created successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  });
})

// SHOW COMMENT ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  var getComment = 'SELECT id, DATE_FORMAT(created_at, \'%d ' + res.__('of') + ' %M %Y\') AS created_at, comment FROM comments WHERE id = ?';
  db.query(getComment, req.params.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render('user/journal/comment/show', {comment:commentInfo});
  })
})

// UPDATE COMMENT ROUTE
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
  var getComment = 'SELECT id, DATE_FORMAT(created_at, \'%d ' + res.__('of') + ' %M %Y\') AS created_at, comment FROM comments WHERE id = ?';
  db.query(getComment, req.params.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render('user/journal/comment/edit', {comment:commentInfo});
  })
})

// UPDATE COMMENT LOGIC
router.put("/:id", middleware.isLoggedIn, (req, res) => {
  console.log("Data: " + req.body.comment);
  var commentbody = {
    created_at: new Date(),
    comment: req.body.comment
  }
  db.query('UPDATE comments SET ? WHERE id = ?', [commentbody, req.params.id], (err, updated) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    console.log('changed ' + updated.changedRows + ' rows');
    req.flash('success', res.__('Comment was updated successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  })
})

// DELETE COMMENT ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var comment2Delete = req.params.id
  var deleteQuery = 'DELETE FROM comments WHERE id = ?'
  // Query to delte the entry
  db.query(deleteQuery, comment2Delete, (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/comment');
    }
    req.flash('success', res.__('Comment was deleted successfully.'))
    res.redirect('/' + req.user.username + '/journal/comment');
  })
})

module.exports = router;
