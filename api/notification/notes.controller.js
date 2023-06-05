const notesService = require('./notes.service.js')

const logger = require('../../services/logger.service.js')

async function getNotes(req, res) {
  try {
    logger.debug('Getting notes')
    const filterBy = {
      txt: req.query.txt || ''
    }
    const notes = await notesService.query(filterBy)
    res.json(notes)
  } catch (err) {
    logger.error('Failed to get notes', err)
    res.status(500).send({ err: 'Failed to get notes' })
  }
}

async function getNotesByUserId(req, res) {
  try {
    const noteId = req.params.id
    const note = await notesService.getById(noteId)
    res.json(note)
  } catch (err) {
    logger.error('Failed to get notee', err)
    res.status(500).send({ err: 'Failed to get note' })
  }
}
async function addNote(req, res) {
  const { loggedinUser } = req

  try {
    const not = req.body
    not.owner = loggedinUser
    const addedNote = await notesService.add(not)
    res.json(addedNote)
  } catch (err) {
    logger.error('Failed to add not', err)
    res.status(500).send({ err: 'Failed to add not' })
  }
}


async function updateNote(req, res) {
  try {
    const not = req.body
    const updatedNote = await notesService.update(not)
    res.json(updatedNote)
  } catch (err) {
    logger.error('Failed to update not', err)
    res.status(500).send({ err: 'Failed to update not' })

  }
}

async function removeNote(req, res) {
  try {
    const noteId = req.params.id
    const removedId = await notesService.remove(noteId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove not', err)
    res.status(500).send({ err: 'Failed to remove not' })
  }
}

async function addNoteComment(req, res) {
  const { loggedinUser } = req
  try {
    const noteId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await notesService.addNoteComment(noteId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update not', err)
    res.status(500).send({ err: 'Failed to update not' })

  }
}

async function removeNoteMsg(req, res) {
  const { loggedinUser } = req
  try {
    const noteId = req.params.id
    const { msgId } = req.params

    const removedId = await notesService.removeNoteMsg(noteId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove not msg', err)
    res.status(500).send({ err: 'Failed to remove not msg' })

  }
}

module.exports = {
  getNotes,
  getNotesByUserId,
  addNote,
  updateNote,
  removeNote,
  addNoteComment,
  removeNoteMsg
}
