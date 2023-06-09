
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
        // set tags and user update 
        userService.setTags(posts)
        return posts;
    } catch (err) {
        logger.error('cannot find posts', err);
        throw err;
    }
}

// returns saved posts of user from post collection
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

// returns posts by criteria txt and user filter user posts
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
        // returns the updated post
        const post = await getById(postId);
        _addToUserNotifications(post, comment.by, 'comment')
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

async function addPostLike(postId, user) {
    try {
        const like = {
            _id: user._id,
            username: user.username,
            imgUrl: user.imgUrl,
        };

        const collection = await dbService.getCollection('post');

        let updatedItem = null;
        const postToUpdate = await getById(postId);
        // TODO: write this better
        const idx = postToUpdate.likedBy.findIndex(by => by._id === user._id);
        if (idx === -1) {
            updatedItem = await collection.findOneAndUpdate(
                { _id: ObjectId(postId) },
                { $push: { likedBy: like } },
                { returnOriginal: false }
            );

            if (updatedItem.value.tags.length) {
                userService.updateUserTags(updatedItem.value.tags, user._id);
            }
            const { _id: byId, ...rest } = user
            const byUser = { byId, ...rest }
            _addToUserNotifications(postToUpdate, byUser, 'like')
        } else {
            postToUpdate.likedBy.splice(idx, 1);
            updatedItem = await collection.findOneAndUpdate(
                { _id: ObjectId(postId) },
                { $set: { likedBy: postToUpdate.likedBy } },
                { returnOriginal: false }
            );
        }

        return updatedItem.value;
    } catch (err) {
        logger.error(`cannot add post like ${postId}`, err);
        throw err;
    }
}

async function _addToUserNotifications(post, byUser, noteType) {
    try {
        const note = {
            noteId: utilService.makeId(),
            type: noteType,
            byUser,
            createdAt: Date.now()
        }
        const collection = await dbService.getCollection('notificatioens')
        collection.findOneAndUpdate(
            { _id: ObjectId('64331f21f126651242ac4beb') },
            { $push: { [`${post.by._id}`]: note } },
            { upsert: true }
        )
    } catch (err) {
        logger.error('cannot insert note', err)
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
    addPostLike
}
