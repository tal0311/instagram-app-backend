const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getMsgByUserId, addMsg, removeMsg, getMsgs } = require('./msg.controller.js')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', requireAuth, getMsgs)
router.get('/:id', requireAuth, getMsgByUserId)
router.delete('/:id', requireAuth, removeMsg)
router.post('/add', requireAuth, addMsg)

// router.delete('/:id', requireAuth, requireAdmin, removeMsg)



module.exports = router