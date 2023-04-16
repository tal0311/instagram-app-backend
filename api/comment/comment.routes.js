const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addComment, getComments, deleteComment } = require('./comment.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getComments)
router.post('/', log, requireAuth, addComment)
router.delete('/:id', requireAuth, deleteComment)

module.exports = router