const express = require('express')
const { requireAuth, requireAdmin, requireOwner } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getPosts, getPostById, addPost, updatePost, removePost, addPostComment, removePostMsg } = require('./post.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getPosts)
router.get('/:id', getPostById)
router.post('/', requireAuth, addPost)
router.put('/:id', requireAuth, updatePost)
router.put('/:id/comment', requireAuth, addPostComment)
router.delete('/:id', requireAuth, requireOwner, removePost)
// router.delete('/:id', requireAuth, requireAdmin, removePost)

// router.post('/:id/msg', requireAuth, addPostComment)
// router.delete('/:id/msg/:msgId', requireAuth, removePostMsg)

module.exports = router