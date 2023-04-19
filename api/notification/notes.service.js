const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = {
            txt: { $regex: '', $options: 'i' }
        }

        const collection = await dbService.getCollection('note')
        var notes = await collection.find(criteria).toArray()
        console.log('posts:', posts.length)
        return notes
    } catch (err) {
        logger.error('cannot find posts', err)
        throw err
    }
}

// async function getById(noteId) {
//     try {
//         const collection = await dbService.getCollection('note')
//         const note = collection.findOne({ _id: ObjectId(noteId) })
//         return note
//     } catch (err) {
//         logger.error(`while finding note ${note}`, err)
//         throw err
//     }
// }


async function add(note) {
    try {
        const collection = await dbService.getCollection('note')
        await collection.insertOne(note)
        return note
    } catch (err) {
        logger.error('cannot insert note', err)
        throw err
    }
}


module.exports = {
    query,
    add,
}
