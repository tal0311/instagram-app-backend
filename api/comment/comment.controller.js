const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const commentService = require('./comment.service')

async function getComments(req, res) {
    try {
        const comments = await commentService.query(req.query)
        res.send(comments)
    } catch (err) {
        logger.error('Cannot get comments', err)
        res.status(500).send({ err: 'Failed to get comments' })
    }
}

async function deleteComment(req, res) {
    try {
        const deletedCount = await commentService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove comment' })
        }
    } catch (err) {
        logger.error('Failed to delete comment', err)
        res.status(500).send({ err: 'Failed to delete comment' })
    }
}


async function addComment(req, res) {

    var { loggedinUser } = req

    try {
        var comment = req.body
        console.log('comment', loggedinUser)
        comment.byUserId = loggedinUser._id
        comment = await commentService.add(comment)

        // prepare the updated comment for sending out
        comment.aboutUser = await userService.getById(comment.aboutUserId)

        // Give the user credit for adding a comment
        // var user = await userService.getById(comment.byUserId)
        // user.score += 10
        loggedinUser.score += 10

        loggedinUser = await userService.update(loggedinUser)
        comment.byUser = loggedinUser

        // User info is saved also in the login-token, update it
        const loginToken = authService.getLoginToken(loggedinUser)
        res.cookie('loginToken', loginToken)

        delete comment.aboutUserId
        delete comment.byUserId

        socketService.broadcast({ type: 'comment-added', data: comment, userId: loggedinUser._id })
        socketService.emitToUser({ type: 'comment-about-you', data: comment, userId: comment.aboutUser._id })

        const fullUser = await userService.getById(loggedinUser._id)
        socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

        res.send(comment)

    } catch (err) {
        logger.error('Failed to add comment', err)
        res.status(500).send({ err: 'Failed to add comment' })
    }
}

module.exports = {
    getComments,
    deleteComment,
    addComment
}