const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(ownerId) {
    logger.info(ownerId)
    try {
        const collection = await dbService.getCollection('msg');
        const result = await collection.aggregate([
            { $match: { ownerId } },
            { $project: { history: { $objectToArray: "$history" } } },
            { $unwind: "$history" },
            {
                $project: {
                    key: "$history.k",
                    user: "$history.v",
                    directPreview: { $arrayElemAt: ["$history.v.msgs", 0] },

                }
            },

        ]).toArray()
        return result
    } catch (error) {

    }
}

async function remove(postId) {
    try {
        const collection = await dbService.getCollection('msg')
        await collection.deleteOne({ _id: ObjectId(postId) })
        return postId
    } catch (err) {
        logger.error(`cannot remove post ${postId}`, err)
        throw err
    }
}
async function getByIdUserId(ownerId, userId) {
    try {
        const collection = await dbService.getCollection('msg');
        const result = collection.aggregate([
            { $match: { ownerId } },
            { $project: { [`history.${userId}`]: 1 } }
        ]).toArray()
        return result
    } catch (err) {
        logger.error(`while finding msg ${ownerId}`, err);
        throw err;
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
    getByIdUserId,
    query
}
