// dependencies
const util = require('util');

// global variables
let db = require('../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.index = (req, res) => {
  res.render('user/strategies/index')
}

module.exports.showStrategy = (req, res) => {
  (async () => {
    var getStrategy = await query(`SELECT id, strategy FROM strategies
      WHERE id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    if (getStrategy[0].strategy == 'None') {
      req.flash('error', res.__('You are not allowed here! This action is illegal.'))
      return res.redirect('/' + req.user.username + '/strategies')
    }
    var getStrategyDoc = await query(`SELECT description FROM strategies_docs
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    var getStrategyRules = await query(`SELECT rule FROM strategies_rules
      WHERE strategy_id = ? AND user_id = ? ORDER BY position;`, [req.params.id, req.user.id]);
    var getStrategyExits = await query(`SELECT name, description, type, order_type FROM strategies_exits
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    var getStrategyObs = await query(`SELECT observation FROM strategies_observations
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    return res.render('user/strategies/show', {
      strategy: getStrategy[0],
      doc: getStrategyDoc[0],
      rules: getStrategyRules,
      exits: getStrategyExits,
      observations: getStrategyObs
    })
  })()
}

module.exports.renderEditForm = (req, res) => {
  (async () => {
    var getStrategy = await query(`SELECT id, strategy FROM strategies
      WHERE id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    if (getStrategy[0].strategy == 'None') {
      req.flash('error', res.__('You are not allowed here! This action is illegal.'))
      return res.redirect('/' + req.user.username + '/strategies')
    }
    var getStrategyDoc = await query(`SELECT description FROM strategies_docs
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    var getStrategyRules = await query(`SELECT id, rule FROM strategies_rules
      WHERE strategy_id = ? AND user_id = ? ORDER BY position;`, [req.params.id, req.user.id]);
    var getStrategyExits = await query(`SELECT id, name, description, type, order_type FROM strategies_exits
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    var getStrategyObs = await query(`SELECT id, observation FROM strategies_observations
      WHERE strategy_id = ? AND user_id = ?;`, [req.params.id, req.user.id]);
    return res.render('user/strategies/edit', {
      strategy: getStrategy[0],
      doc: getStrategyDoc[0],
      rules: getStrategyRules,
      exits: getStrategyExits,
      observations: getStrategyObs,
      saved: res.__('Saved'),
      saving: res.__('Saving')
    })
  })()
}

module.exports.updateStrategy = (req, res) => {
  (async () => {
    var insertId = 0
    var addingType;
    try {
      var getStrategyDoc = await query(`SELECT * FROM strategies_docs WHERE user_id = ? AND strategy_id = ?`, [req.user.id, req.params.id])
      if (getStrategyDoc.length < 1) {
        var strategyDoc = {
          user_id: req.user.id,
          strategy_id: req.params.id
        }
        var createStrategyDoc = await query(`INSERT INTO strategies_docs SET ?`, strategyDoc)
      }
      switch (req.body.type) {
        case 'description':
          var saveDescription = await query(`UPDATE strategies_docs SET description = ?
            WHERE user_id = ? AND strategy_id = ?`, [req.body.content, req.user.id, req.params.id])
          break;
        case 'rules':
          switch (req.body.method) {
            case 'order':
              req.body.content.forEach(async (rule, i) => {
                var reorderRule = await query(`UPDATE strategies_rules SET position = ${i + 1}
                  WHERE id = ? AND user_id = ? AND strategy_id = ?`, [rule, req.user.id, req.params.id])
              });
              break;
            case 'delete':
              var deleteRule = await query(`DELETE FROM strategies_rules
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.user.id, req.params.id])
              break;
            case 'new':
              var getRuleOrder = await query(`SELECT position FROM strategies_rules
                WHERE user_id = ? AND strategy_id = ? ORDER BY position DESC LIMIT 1`, [req.user.id, req.params.id])
              var position = (typeof getRuleOrder[0] !== 'undefined') ?  getRuleOrder[0].position + 1 : 1
              console.log(position);
              var rule = {
                user_id: req.user.id,
                strategy_id: Number(req.params.id),
                rule: req.body.content,
                position: position,
              }
              var addRule = await query(`INSERT INTO strategies_rules SET ?`, rule)
              addingType = 'rules'
              insertId = addRule.insertId
              break;
          }
          break;
        case 'exits':
          switch (req.body.method) {
            case 'new':
              var exit = {
                user_id: req.user.id,
                strategy_id: Number(req.params.id),
                type: 'Loss',
                order_type: 'Market order'
              }
              var newExit = await query(`INSERT INTO strategies_exits SET ?`, exit)
              addingType = 'exit'
              insertId = newExit.insertId
              break;
            case 'delete':
              var deleteExit = await query(`DELETE FROM strategies_exits
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.user.id, req.params.id])
              break;
            case 'name':
              var updateExitName = await query(`UPDATE strategies_exits SET name = ?
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.body.id, req.user.id, req.params.id])
              break;
            case 'type':
              var updateExitType = await query(`UPDATE strategies_exits SET type = ?
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.body.id, req.user.id, req.params.id])
              break;
            case 'order':
              var updateExitOrder = await query(`UPDATE strategies_exits SET order_type = ?
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.body.id, req.user.id, req.params.id])
              break;
            case 'description':
              var updateExitDescription = await query(`UPDATE strategies_exits SET description = ?
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.body.id, req.user.id, req.params.id])
              break;
          }
          break;
        case 'observations':
          switch (req.body.method) {
            case 'new':
            var observation = {
              user_id: req.user.id,
              strategy_id: Number(req.params.id),
            }
            var newObservation = await query(`INSERT INTO strategies_observations SET ?`, observation)
            addingType = 'observation'
            insertId = newObservation.insertId
              break;
            case 'delete':
              var deleteObservation = await query(`DELETE FROM strategies_observations
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.user.id, req.params.id])
              break;
            case 'description':
              var updateObservation = await query(`UPDATE strategies_observations SET observation = ?
                WHERE id = ? AND user_id = ? AND strategy_id = ?`, [req.body.content, req.body.id, req.user.id, req.params.id])
              break;
          }
          break;
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (insertId != 0) {
        if (addingType == 'rules') {
          return res.send({
            status: 'done',
            type: 'rules',
            id: insertId,
            content: req.body.content
          })
        }
        if (addingType == 'exit') {
          return res.send({
            status: 'done',
            type: 'exit',
            id: insertId
          })
        } else if (addingType == 'observation') {
          return res.send({
            status: 'done',
            type: 'observation',
            id: insertId
          })
        }

      } else {
        return res.send({
          status: 'done'
        })
      }
    }
  })()
}
