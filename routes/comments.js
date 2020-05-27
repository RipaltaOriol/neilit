var express = require('express');
var router = express.Router({mergeParams: true});

// INDEX COMMENTS ROUTE
// FIXME: How to optmize when loading a large sample (LOAD AS YOU GO)
router.get("/", isLoggedIn, (req, res) => {
  var getAllComments = 'SELECT DATE_FORMAT(created_at, "%d/%m/%y %H:%i") AS created_at, comment FROM comments WHERE user_id = ?';
  var getAllEntries = 'SELECT DATE_FORMAT(entry_dt, "%d/%m/%y %H:%i") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ?';
  var listComments = {
    date: [],
    content: []
  }
  listEntries = {
    date: [],
    content: []
  }
  connection.query(getAllComments, req.user.id, (err, results) => {
    if (err) throw err;
    results.forEach((result) => {
      listComments.date.push(result.created_at);
      listComments.content.push(result.comment);
    });
    connection.query(getAllEntries, req.user.id, (err, results) => {
      if (err) throw err;
      results.forEach((result) => {
        listEntries.date.push(result.entry_dt);
        listEntries.content.push(result.pair);
      });
      res.render("user/journal/comment/index", {historyComment: listComments, historyEntry: listEntries})
    })
  })
})

// NEW COMMNET ROUTE
router.get("/new", isLoggedIn, (req, res) => {
  res.render("user/journal/comment/new")
})

// NEW COMMENT LOGIC
router.post("/", isLoggedIn, (req, res) => {
  var commentQuery = 'INSERT INTO comments SET ?';
  // create object w/ comment info
  var newcomment = {
    user_id: req.user.id,
    comment: req.body.comment
  }
  // save comment to the DB
  connection.query(commentQuery, newcomment, (err, results) => {
    if (err) throw err;
    //console.log(results.insertId);
    res.redirect('/' + req.user.username + '/journal');
  });
})

// SHOW COMMENT ROUTE
router.get("/:id", isLoggedIn, (req, res) => {
  var getComment = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at, comment FROM comments WHERE id = ?';
  connection.query(getComment, req.params.id, (err, results) => {
    if (err) throw err;
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render('user/journal/comment/show', {comment:commentInfo});
  })
})

// UPDATE COMMENT ROUTE
router.get("/:id/edit", isLoggedIn, (req, res) => {
  var getComment = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at, comment FROM comments WHERE id = ?';
  connection.query(getComment, req.params.id, (err, results) => {
    if (err) throw err;
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render('user/journal/comment/edit', {comment:commentInfo});
  })
})

// UPDATE COMMENT LOGIC
router.put("/:id", isLoggedIn, (req, res) => {
  console.log("Data: " + req.body.comment);
  var commentbody = {
    created_at: new Date(),
    comment: req.body.comment
  }
  connection.query('UPDATE comments SET ? WHERE id = ?', [commentbody, req.params.id], (err, updated) => {
    if (err) throw err;
    console.log('changed ' + updated.changedRows + ' rows');
    res.redirect('/' + req.user.username + '/journal');
  })
})

// DELETE COMMENT ROUTE
router.delete("/:id", isLoggedIn, (req, res) => {
  var comment2Delete = req.params.id
  var deleteQuery = 'DELETE FROM comments WHERE id = ?'
  // Query to delte the entry
  connection.query(deleteQuery, comment2Delete, (err) => {
    if (err) throw err;
    res.redirect('/' + req.user.username + '/journal');
  })
})

// AUTHENTICATION MIDDLEWARE
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user.username === req.params.profile) {
      return next();
    } else {
      // FIXME: so it doesn't freeze and return to previous ROUTE
      return false;
    }
  } else {
    req.flash("error", "Please, login first!")
    res.redirect("/login");
  }
}

module.exports = router;
