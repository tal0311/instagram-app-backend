
const asyncLocalStorage = require('../../services/als.service')
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const commentService = require('../comment/comment.service')
const ObjectId = require('mongodb').ObjectId


module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    setTags,
    updateUserTags
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ _id: ObjectId(userId) })
        delete user.password

        user.givenComments = await commentService.query({ byUserId: ObjectId(user._id) })
        // user.givenComments = user.givenComments.map(comment => {
        //     delete comment.byUser
        //     return comment
        // })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ _id: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId(user._id), // needed for the returnd obj
            fullname: user.fullname, // if you want to allow updating username
            tags: user.tags // if you want to allow updating usrTags

        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function setTags(posts) {

    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!posts || !posts.length) return
    posts = posts.map(post => {
        if (post.tags) {
            return post.tags
        }
    })
    const userTags = [...new Set(posts.flatMap(tag => tag))]
    const user = await getById(loggedinUser._id)
    user.tags = userTags

    update(user)
}

async function updateUserTags(postTags, userId) {
    const user = await getById(userId)
    postTags.forEach(tag => {
        if (!user.tags.includes(tag)) {
            user.tags.push(tag)
        }
    });

    update(user)
}

async function add(user) {
    try {
        const userToAdd = getEmptyUser(user.fullname, user.password, user.username, user.imgUrl)

        console.log('userToAdd:', userToAdd)
        const collection = await dbService.getCollection('user')
        const addedUser = await collection.insertOne(userToAdd)
        return addedUser
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

// TODO: change default img
function getEmptyUser(fullname, password, username, imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png') {
    return {
        username,
        imgUrl,
        fullname,
        password,
        createdAt: Date.now(),
        following: [],
        followers: [],
        savedPostIds: [],
        stories: [],
        highlights: []
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}




