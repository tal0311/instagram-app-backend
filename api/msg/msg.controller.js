const msgsService = require('./msg.service.js')
const utilService = require('../../services/util.service.js')

const logger = require('../../services/logger.service.js')

async function getMsgs(req, res) {
  try {
    const { loggedinUser } = req
    const msgs = await msgsService.query(loggedinUser._id)
    res.send(msgs)
  } catch (error) {
    logger.error('Failed to get msgs', err)
    res.status(500).send({ err: 'Failed to get msgs history' })
  }

}

async function getMsgByUserId(req, res) {
  try {
    const { id: msgId } = req.params
    const { loggedinUser } = req
    const msgsHistory = await msgsService.getByIdUserId(loggedinUser._id, msgId)
    res.json({ _id: msgId, ...msgsHistory[0][loggedinUser._id].history[msgId] })

  } catch (err) {
    logger.error('Failed to get msgs by user id', err)
    res.status(500).send({ err: 'Failed to get msgs history by user id' })
  }
}

async function addMsg(req, res) {
  const { loggedinUser } = req
  try {
    const msg = req.body
    msg.by = loggedinUser._id
    msg.msgId = utilService.makeId()
    await msgsService.add(msg)
    res.json(msg)
  } catch (err) {
    logger.error('Failed to add msg', err)
    res.status(500).send({ err: 'Failed to add msg' })
  }
}



async function removeMsg(req, res) {
  try {
    const msgId = req.params.id
    const removedId = await msgsService.remove(msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove msg', err)
    res.status(500).send({ err: 'Failed to remove msg' })
  }
}





module.exports = {
  addMsg,
  removeMsg,
  getMsgByUserId,
  getMsgs
}
