
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { txt: 'generally' }) {
    try {
        const criteria = {
            txt: { $regex: '', $options: 'i' }
        }

        const collection = await dbService.getCollection('post')
        var posts = await collection.find(criteria).toArray()
        console.log('posts:', posts.length)
        return posts
    } catch (err) {
        logger.error('cannot find posts', err)
        throw err
    }
}

async function getById(postId) {
    try {
        const collection = await dbService.getCollection('post')
        const post = collection.findOne({ _id: ObjectId(postId) })
        return post
    } catch (err) {
        logger.error(`while finding post ${postId}`, err)
        throw err
    }
}

async function remove(postId) {
    try {
        const collection = await dbService.getCollection('post')
        await collection.deleteOne({ _id: ObjectId(postId) })
        return postId
    } catch (err) {
        logger.error(`cannot remove post ${postId}`, err)
        throw err
    }
}

async function add(post) {
    try {
        post.tags = [..._getPostTags(post.txt)]
        const collection = await dbService.getCollection('post')
        await collection.insertOne(post)
        return post
    } catch (err) {
        logger.error('cannot insert post', err)
        throw err
    }
}

async function update(post) {
    try {
        // TODO: VALIDATE POST FROM BODY
        const postId = post._id
        delete post._id
        const collection = await dbService.getCollection('post')
        await collection.updateOne({ _id: ObjectId(postId) }, { $set: post })
        post._id = postId
        return post
    } catch (err) {
        logger.error(`cannot update post ${postId}`, err)
        throw err
    }
}

async function addPostComment(postId, comment) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('post')
        await collection.updateOne({ _id: ObjectId(postId) }, { $push: { comments: comment } })
        return msg
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

async function removePostMsg(postId, commentId) {
    try {
        const collection = await dbService.getCollection('post')
        await collection.updateOne({ _id: ObjectId(postId) }, { $pull: { comments: { id: commentId } } })
        return commentId
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

// helpers
function _getPostTags(txt) {
    if (!txt) return []
    return txt.split(' ').filter(word => word.startsWith('#')).map(tag => tag.substring(1).trim())
}


module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addPostComment,
    removePostMsg
}
