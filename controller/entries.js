// dependencies
const util    = require('util');
const fetch   = require('node-fetch');
const multer  = require('multer');
const uuid    = require('uuid/v4');

const storage = multer.memoryStorage({
  destination: function(req, file, cb) {
    cb(null, '')
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true)
  } else {
    // reject file if the type is not correct
    cb(null, false)
  }
}

const upload  = multer({
  storage: storage,
  lmits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

// global variables
let pairs       = require('../models/pairs');
let currencies  = require('../models/currencies');
let categories  = require('../models/categories');
let db          = require('../models/dbConfig');
let logger      = require('../models/winstonConfig');
let s3          = require('../models/s3Config');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.multerHandle = upload.single('file')

module.exports.index = (req, res) => {
  var getEntries = 'SELECT * FROM entries WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 25;';
  var getEntries = `SELECT e.id, pair, e.entry_dt, result, status, strategy, timeframe FROM entries e
    JOIN strategies s on e.strategy_id = s.id
    JOIN pairs p on e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.user_id = ? ORDER BY entry_dt DESC LIMIT 25;`
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    res.render("user/journal/entry/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' },
        currencies: req.session.assets,
        categories: categories,
      }
    );
  })
}

module.exports.indexInfinite = (req, res) => {
  var getEntries = `SELECT e.id, pair, e.entry_dt, result, status, strategy, timeframe FROM entries e
    JOIN strategies s on e.strategy_id = s.id
    JOIN pairs p on e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.user_id = ? ORDER BY entry_dt DESC LIMIT 25 OFFSET ?;`;
  if (req.body.query) { getEntries = req.body.query + ' OFFSET ?;'}
  db.query(getEntries, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not INFINITE SCROLL getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' }
    });
  })
}

module.exports.filter = (req, res) => {
  var createFilter = ''
  var exitFilter = ''
  if (req.body.create) { createFilter = '&& entry_dt >= ' + req.body.create + ' >= entry_dt' }
  if (req.body.exit) { exitFilter = '&& exit_dt >= ' + req.body.exit + '>= exit_dt' }
  var getEntries = `SELECT *, entries.id AS id FROM entries
    JOIN pairs ON entries.pair_id = pairs.id
    JOIN strategies ON entries.strategy_id = strategies.id
    JOIN timeframes ON entries.timeframe_id = timeframes.id
    WHERE entries.user_id = ? && (${req.body.pairs}) && (${req.body.categories})
      && (${req.body.strategy}) && (${req.body.timeframe})
      && (${req.body.result}) ${createFilter} ${exitFilter}
    ORDER BY ${req.body.sort} ${req.body.order} LIMIT 25`;
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not FILTER getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      query: getEntries
    });
  })
}

module.exports.createEntry = async (req, res) => {
  if (Object.keys(req.session.assets).length === 0) {
    req.flash('error', res.__('You are not able to access here without any assets. Go to settings to add an asset.'))
    return res.redirect('/' + req.user.username + '/journal/entry');
  }
  var newEntry = {
    user_id: req.user.id,
    pair_id: req.session.assets[Object.keys(req.session.assets)[0]].id,
    category: req.session.assets[Object.keys(req.session.assets)[0]].category,
    strategy_id: req.session.strategyIds[0],
    timeframe_id: req.session.timeframes[Object.keys(req.session.timeframes)[0]].id,
    direction: 'long',
    status: 0
  }
  var createEntry = 'INSERT INTO entries SET ?'
  db.query(createEntry, newEntry, (err, entryInfo) => {
    if (err) {
      console.log(err);
      logger.error({
        message: 'ENTRIES (create) could not createEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    return res.redirect('/' + req.user.username + "/journal/entry/" + entryInfo.insertId + '/edit');
  })
}

module.exports.showEntry = (req, res) => {
  var getEntry = `SELECT *, e.id AS id, e.category AS category, DATE_FORMAT(entry_dt, '%H:%i') AS created_time FROM entries e
    JOIN strategies s ON e.strategy_id = s.id
    JOIN pairs p ON e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.id = ?;`
  var getEntryImages = 'SELECT image1, image2, image3, image4 FROM entries_imgs WHERE entry_id = ?'
  var getCurrency = 'SELECT currency FROM currencies WHERE id = ?;';
  var getPrev = 'SELECT id FROM entries WHERE entry_dt < ? AND user_id = ? ORDER BY entry_dt DESC LIMIT 1;'
  var getNext = 'SELECT id FROM entries WHERE entry_dt > ? AND user_id = ? ORDER BY entry_dt LIMIT 1;'
  db.query(getEntry, req.params.id, (err, entryInfo) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (show) could not getEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    if (!entryInfo.length) {
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    db.query(getEntryImages, req.params.id, (err, imgsInfo) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (show) could not getEntryImages',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      db.query(getCurrency, req.user.currency_id, (err, result) => {
        if (err) {
          logger.error({
            message: 'ENTRIES (show) could not getCurrency',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
          req.flash('error', res.__('Something went wrong, please try again later.'))
          return res.redirect('/' + req.user.username + "/journal/entry");
        }
        db.query(getPrev, [entryInfo[0].entry_dt, req.user.id], (err, prevEntry) => {
          if (err) {
            logger.error({
              message: 'ENTRIES (show) could not getPrev',
              endpoint: req.method + ': ' + req.originalUrl,
              programMsg: err
            })
          }
          db.query(getNext, [entryInfo[0].entry_dt, req.user.id], (err, nextEntry) => {
            if (err) {
              logger.error({
                message: 'ENTRIES (show) could not getNext',
                endpoint: req.method + ': ' + req.originalUrl,
                programMsg: err
              })
            }
            imgsInfo.length === 0 ? imgsInfo.push({}) : false
            res.render("user/journal/entry/show",
              {
                currency: result[0].currency,
                currencies: pairs,
                entryInfo: entryInfo[0],
                entryImgs: imgsInfo[0],
                prevEntry: prevEntry,
                nextEntry: nextEntry,
                options: { year: 'numeric', month: 'long', day: 'numeric' }
              }
            );
          })
        })
      })
    })
  })
}

module.exports.renderEditForm = (req, res) => {
  // inserts DB queries to a variable
  var getEntry = `SELECT *, e.id AS id, e.category AS category, DATE_FORMAT(entry_dt, '%Y-%m-%d') AS open_format,
      DATE_FORMAT(entry_dt, '%Y-%m-%d') AS close_format FROM entries e
    JOIN strategies s ON e.strategy_id = s.id
    JOIN pairs p ON e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.id = ?;`
  var getTas = `SELECT ta.id, pair, created_at FROM tanalysis ta
    JOIN pairs p on ta.pair_id = p.id WHERE ta.user_id = ?;`
  var getEntryImages = 'SELECT image1, image2, image3, image4 FROM entries_imgs WHERE entry_id = ?'
  var selectCurrency = 'SELECT currency FROM currencies WHERE id = ?;'
  db.query(getEntry, req.params.id, (err, entryInfo) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (edit) could not getEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    // gets the technical analysis from the user
    db.query(getTas, req.user.id, (err, taInfo) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (edit) could not getTas',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      db.query(getEntryImages, req.params.id, (err, imgsInfo) => {
        if (err) {
          logger.error({
            message: 'ENTRIES (edit) could not getEntryImgs',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
          req.flash('error', res.__('Something went wrong, please try again later.'))
          return res.redirect('/' + req.user.username + "/journal/entry");
        }
        db.query(selectCurrency, req.user.currency_id, (err, result) => {
          if (err) {
            logger.error({
              message: 'ENTRIES (edit) could not selectCurrency',
              endpoint: req.method + ': ' + req.originalUrl,
              programMsg: err
            })
            req.flash('error', res.__('Something went wrong, please try again later.'))
            return res.redirect('/' + req.user.username + "/journal/entry");
          }
          imgsInfo.length === 0 ? imgsInfo.push({}) : false
          res.render("user/journal/entry/edit",
            {
              currency: result[0].currency,
              currencies: req.session.assets,
              entryInfo: entryInfo[0],
              entryImgs: imgsInfo[0],
              technicalAnalysis: taInfo,
              saved: res.__('Saved'),
              saving: res.__('Saving'),
              options: { year: 'numeric', month: 'long', day: 'numeric' }
            }
          );
        })
      })
    })
  })
}

module.exports.editPair = async(req, res) => {
  const status = 1;
  try {
    var updatePair = await query('UPDATE entries SET pair_id = ?, category = ? WHERE id = ?',
      [req.body.value, req.body.category, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit pair',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status})

  }

}

module.exports.editStrategy = async(req, res) => {
  const status = 1;
  try {
    var updateStrategy = await query('UPDATE entries SET strategy_id = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit strategy',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editTimeframe = async(req, res) => {
  const status = 1;
  try {
    var updateTimeframe = await query('UPDATE entries SET timeframe_id = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit timeframe',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editSize = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateSize = await query('UPDATE entries SET size = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit size',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editEntryPrice = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateEntryPrice = await query('UPDATE entries SET entry_price = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit entry price',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editStopLoss = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateStopLoss = await query('UPDATE entries SET stop_loss = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit stop loss',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editTakeProfit = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateTakeProfit = await query('UPDATE entries SET take_profit = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit take profit',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editEntryDate = async(req, res) => {
  const status = 1;
  try {
    var updateEntryDate = await query('UPDATE entries SET entry_dt = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit entry-date',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editDirection = async(req, res) => {
  const status = 1;
  try {
    var updateDirection = await query('UPDATE entries SET direction = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit direction',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editTa = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateTa = await query('UPDATE entries SET ta_id = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit connected ta',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editComment = async(req, res) => {
  const status = 1;
  try {
    var updateComment = await query('UPDATE entries SET comment = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit comment',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editImageURL = async(req, res) => {
  const status = 1;
  try {
    const getEntryImgs = await query('SELECT id FROM entries_imgs WHERE entry_id = ?', [req.params.id])
    if (getEntryImgs.length === 0) {
      var newEntryImgs = { entry_id: req.params.id }
      const createEntryImgs = await query('INSERT INTO entries_imgs SET ?', newEntryImgs)
    }
    const updateImgs = await query(`UPDATE entries_imgs SET image${req.body.number} = ? WHERE entry_id = ?`, [req.body.src, req.params.id])

  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not insert URL images',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editImageFile = async(req, res) => {
  const status = 1;
  let url
  try {
    if (req.file === undefined) {
      return res.send({ status: status })
    }
    const getEntryImgs = await query('SELECT id FROM entries_imgs WHERE entry_id = ?', [req.params.id])
    if (getEntryImgs.length === 0) {
      var newEntryImgs = { entry_id: req.params.id }
      const createEntryImgs = await query('INSERT INTO entries_imgs SET ?', newEntryImgs)
    }
    var fileName = req.file.originalname.split('.')
    var fileType = fileName[fileName.length - 1]
    var params = {
      Bucket: process.env.S3_BUCKET,
      Key: `${req.user.id}/entries/${req.params.id}/${uuid()}.${fileType}`,
      Body: req.file.buffer
    }
    s3.upload(params, (err, data) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (edit) could not upload file to s3',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        status = 0;
        return res.send({ status: status })
      }
      url = data.Location
      var updateProfilePicture = `UPDATE entries_imgs SET image${req.body.number} = ? WHERE entry_id = ?`
      db.query(updateProfilePicture, [data.Location, req.params.id], (err) => {
        if (err) {
          logger.error({
            message: 'ENTRIES (edit) could not insert file images',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
        }
        return res.send({
          status: status,
          urlPoint: url
        })
      })
    })
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not insert file images',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  }
}

module.exports.editStatus = async(req, res) => {
  const status = 1;
  try {
    var getStatus = await query('SELECT status, result FROM entries WHERE id = ?',
      req.params.id)
    if (getStatus[0].status == 0 && getStatus[0].result == null) {
      var currentDate = new Date()
      const offset = currentDate.getTimezoneOffset();
      currentDate = new Date(currentDate.getTime() + (offset * 60 * 1000));
      currentDate = currentDate.toISOString().split('T')[0]
      varUpdateStatus = await query(`UPDATE entries SET status = ?,
        exit_dt = ?,
        exit_price = ?,
        profits = ?,
        fees = ?,
        result = ? WHERE id = ?`, [req.body.value, currentDate, 0, 0, 0, 'be', req.params.id])
    } else {
      var updateStatus = await query('UPDATE entries SET status = ? WHERE id = ?',
        [req.body.value, req.params.id])
    }
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit status',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editExitDate = async(req, res) => {
  const status = 1;
  try {
    var updateEntryDate = await query('UPDATE entries SET exit_dt = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit exit-date',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editExitPrice = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateTakeProfit = await query('UPDATE entries SET exit_price = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit exit price',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}


module.exports.editProfit = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateTakeProfit = await query('UPDATE entries SET profits = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit profits',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editFees = async(req, res) => {
  const status = 1;
  try {
    if (req.body.value === '') req.body.value = null
    var updateTakeProfit = await query('UPDATE entries SET fees = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit fees',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.editResult = async(req, res) => {
  const status = 1;
  try {
    var updateEntryDate = await query('UPDATE entries SET result = ? WHERE id = ?',
      [req.body.value, req.params.id])
  } catch (err) {
    logger.error({
      message: 'ENTRIES (edit) could not edit status',
      endpoint: req.method + ': ' + req.originalUrl,
      programMsg: err
    })
    status = 0;
  } finally {
    return res.send({ status: status })
  }
}

module.exports.updateEntry = async (req, res) => {
  // checks whether the entry contains the required fields
  if (req.body.size == '') {
    req.flash("error", res.__('Position size cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  } else if (req.body.entryPrice == '') {
    req.flash("error", res.__('Entry price cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  } else if (req.body.entryDate == '') {
    req.flash("error", res.__('Entry date cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  }
  // creates an object with the new entry variables
  else {
    var newEntry = {
      user_id: req.user.id,
      pair_id: req.body.pair,
      category: req.body.category,
      size: Number(req.body.size),
      strategy_id: req.body.strategy,
      timeframe_id: req.body.timeframe,
      entry_price: req.body.entryPrice,
    }
    // sets the entry date and time of the entry
    if (req.body.entryTime == '') {
      newEntry.entry_dt = req.body.entryDate + ' 00:00:00'
    } else {
      if (validateHhMm(req.body.entryTime)) {
        newEntry.entry_dt = req.body.entryDate + ' ' + req.body.entryTime
      } else {
        req.flash("error", res.__('The entry time has to be typed in military time. For instnace, 14:45.'))
        return res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      }
    }
    // sets the operation direction of the entry
    if (req.body.direction == 1) {
      newEntry.direction = 'long';
    } else if (req.body.direction == -1) {
      newEntry.direction = 'short';
    } else {
      req.flash("error", res.__('Entry direction cannot be blank.'))
      res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
    }
    // sets the stop loss of the entry
    if (req.body.stopLoss != '') {
      newEntry.stop_loss = req.body.stopLoss;
    }
    // sets the take profit of the entry
    if (req.body.takeProfit != '') {
      newEntry.take_profit = req.body.takeProfit;
    }
    // connects a technical analysis to the entry (if any)
    if (req.body.selectTa == 'select') {
      if (req.body.entryTa != '') {
        newEntry.ta_id = req.body.entryTa;
      } else {
        req.flash("error", res.__('The entry was not connected to any TA. Please, try again.'))
        return res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      }
    }
    // sets the comment field of the entry
    if (req.body.comment != '') {
      newEntry.comment = req.body.comment;
    }
    // sets closure of the entry
    if (req.body.status == 1) {
      if (req.body.exitDate == '') {
        newEntry.exit_dt = new Date();
      } else {
        newEntry.exit_dt = req.body.exitDate + ' 00:00:00'
      }
      if (req.body.closePrice == '') {
        req.flash("error", res.__('Exit price cannot be blank for closed entries.'))
        res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      } else {
        newEntry.exit_price = req.body.closePrice;
      }
      newEntry.status = req.body.status;
      newEntry.fees = 0;
      newEntry.result = req.body.result;
      // sets the fees of the entry
      if (req.body.fees != '') {
        newEntry.fees = req.body.fees;
      }
      // sets the profits of the entry
      if (req.body.profits != '') {
        newEntry.profits = req.body.profits;
      } else {
        var getTradingPair = await query('SELECT pair FROM pairs WHERE id = ?', req.body.pair)
        if (req.session.assets[getTradingPair[0].pair].rate) {
          var quote = getTradingPair[0].pair.split('/')[1];
          var getBase = await query('SELECT currency FROM currencies WHERE id = ?', req.user.currency_id)
          await fetch(`https://api.exchangeratesapi.io/latest?base=${quote}`)
          .then(res => res.json())
          .then((data) => {
            switch (req.session.assets[getTradingPair[0].pair].category) {
              case 'Forex':
                var lotSize = (quote === 'JPY') ? 1000 : 100000;
                var entryAmount;
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount;
                break;
              case 'Crypto':
                var base = getTradingPair[0].pair.split('/')[1];
                var entryAmount
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount
                break;
            }
          })
          .catch((err) => {
            if (err) {
              logger.error({
                message: 'ENTRIES (edit) could not make the API call',
                endpoint: req.method + ': ' + req.originalUrl,
                programMsg: err
              })
              req.flash('error', res.__('Something went wrong, please try again later.'))
              return res.redirect('/' + req.user.username + "/journal/entry");
            }
          })
        } else {
          req.flash('error', res.__('We don\'t have the rate for this asset. Please, introduce your profits.'))
          return res.redirect('/' + req.user.username + "/journal/entry/" + req.params.id + "/edit");
        }
      }
    } else {
      newEntry.status = 0;
      newEntry.exit_dt = null;
      newEntry.exit_price = null;
      newEntry.profits = null;
      newEntry.fees = null;
      newEntry.result = null;
    }
    // updated the entry on the DB
    db.query('UPDATE entries SET ? WHERE id = ?', [newEntry, req.params.id], (err, response) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (edit) could not edit entry',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      req.flash('success', res.__('The entry was updated successfully.'))
      res.redirect("/" + req.user.username + "/journal/entry");
    })
  }
}

module.exports.deleteEntry = (req, res) => {
  var deleteEntry = 'DELETE FROM entries WHERE id = ?'
  db.query(deleteEntry, req.params.id, (err) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (delete) could not deleteEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    res.redirect("/" + req.user.username + "/journal/entry");
  })
}
