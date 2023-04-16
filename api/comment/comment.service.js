const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('comment')
        // const comments = await collection.find(criteria).toArray()
        var comments = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'byUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser'
                }
            },
            {
                $unwind: '$byUser'
            },
            {
                $lookup:
                {
                    localField: 'aboutUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'aboutUser'
                }
            },
            {
                $unwind: '$aboutUser'
            }
        ]).toArray()
        comments = comments.map(comment => {
            comment.byUser = { _id: comment.byUser._id, fullname: comment.byUser.fullname }
            comment.aboutUser = { _id: comment.aboutUser._id, fullname: comment.aboutUser.fullname }
            delete comment.byUserId
            delete comment.aboutUserId
            return comment
        })

        return comments
    } catch (err) {
        logger.error('cannot find comments', err)
        throw err
    }

}

async function remove(commentId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('comment')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(commentId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove comment ${commentId}`, err)
        throw err
    }
}


async function add(comment) {
    try {
        const commentToAdd = {
            byUserId: ObjectId(comment.byUserId),
            aboutUserId: ObjectId(comment.aboutUserId),
            txt: comment.txt
        }
        const collection = await dbService.getCollection('comment')
        await collection.insertOne(commentToAdd)
        return commentToAdd
    } catch (err) {
        logger.error('cannot insert comment', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


