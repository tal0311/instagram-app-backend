
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const userService = require('../user/user.service')

const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { txt: '', userFilter: '', userId: '' }) {
    try {

        let criteria = {}
        if (filterBy.txt || filterBy.userFilter === 'post') {
            criteria = buildCriteria(filterBy);
            console.log('criteria:', criteria)
        }

        if (filterBy.userId && filterBy.userFilter === 'saved-posts') {
            return await userCriteria(filterBy.userId);
        }

        const collection = await dbService.getCollection('post');
        var posts = await collection.aggregate(criteria).toArray();
        console.log('posts:', posts.length)
        return posts;
    } catch (err) {
        logger.error('cannot find posts', err);
        throw err;
    }
}


async function userCriteria(userId) {
    const userCollection = await dbService.getCollection('user');

    const pipeline = [
        {
            $match: { _id: ObjectId(userId) }
        },
        {
            $lookup: {
                from: "post",
                let: { savedPostIds: "$savedPostIds" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    { $toString: "$_id" },
                                    { $map: { input: "$$savedPostIds", as: "id", in: { $toString: "$$id" } } }
                                ]
                            }
                        }
                    }
                ],
                as: "savedPosts"
            }
        },
        {
            $project: {
                savedPosts: 1
            }
        }
    ];

    const result = await userCollection.aggregate(pipeline).toArray();

    return result[0].savedPosts;
}


function buildCriteria({ txt, userFilter, userId }) {

    let pipeline = []
    if (txt) {

        pipeline.push(
            {
                $match: {
                    txt: {
                        $regex: txt,
                        $options: 'i'
                    }
                }
            })
    }

    if (userId && userFilter === 'post') {
        pipeline.push(
            {
                $match: {
                    "by._id": userId
                }
            })
    }

    return pipeline

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
        comment.id = utilService.makeId()
        const collection = await dbService.getCollection('post')
        // Your code to update and retrieve the updated item
        const updatedItem = await collection.findOneAndUpdate(
            { _id: ObjectId(postId) },
            { $push: { comments: comment } },
            { returnOriginal: false }
        );

        return updatedItem.value
    } catch (err) {
        logger.error(`cannot add post comment ${postId}`, err)
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
