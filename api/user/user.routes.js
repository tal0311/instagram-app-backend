const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { getUser, getUsers, deleteUser, updateUser, toggleFollow, toggleSavePost, getUserStory } = require('./user.controller')

const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', requireAuth, getUsers)
router.get('/:id', getUser)
router.get('/:id/story', getUserStory)
router.put('/:id', requireAuth, updateUser)
router.put('/:id/follow', requireAuth, toggleFollow)
router.put('/:id/save', requireAuth, toggleSavePost)

// router.put('/:id',  requireAuth, updateUser)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

module.exports = router