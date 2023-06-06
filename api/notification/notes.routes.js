const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getNotes, getNotesByUserId, addNote, updateNote, removeNote, addNoteComment, removeNoteMsg } = require('./notes.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getNotes)
router.get('/:id', getNotesByUserId)
router.post('/', requireAuth, addNote)
router.put('/:id', requireAuth, updateNote)
router.delete('/:id', requireAuth, removeNote)
// router.delete('/:id', requireAuth, requireAdmin, removeNote)

router.post('/:id/msg', requireAuth, addNoteComment)
router.delete('/:id/msg/:msgId', requireAuth, removeNoteMsg)

module.exports = router