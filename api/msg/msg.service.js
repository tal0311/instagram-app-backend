const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId


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
async function getByIdUserId(userId) {
    try {
        const collection = await dbService.getCollection('msg')
        const msg = collection.findOne({ _id: ObjectId(msgId) })
        return msg
    } catch (err) {
        logger.error(`while finding msg ${msg}`, err)
        throw err
    }
}


async function add(msg) {
    try {
        const collection = await dbService.getCollection('msg')
        await collection.insertOne(msg)
        return msg
    } catch (err) {
        logger.error('cannot insert msg', err)
        throw err
    }
}


module.exports = {

    add,
    remove,
    getByIdUserId
}
