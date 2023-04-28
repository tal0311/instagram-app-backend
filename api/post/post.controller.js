const PostService = require('./post.service.js')

const logger = require('../../services/logger.service.js')

async function getPosts(req, res) {
  try {
    logger.debug('Getting Posts')
    const filterBy = {
      txt: req.query.txt || ''
    }
    const Posts = await PostService.query(filterBy)
    res.json(Posts)
  } catch (err) {
    logger.error('Failed to get Posts', err)
    res.status(500).send({ err: 'Failed to get Posts' })
  }
}

async function getPostById(req, res) {
  try {
    const PostId = req.params.id
    const post = await PostService.getById(PostId)
    res.json(post)
  } catch (err) {
    logger.error('Failed to get post', err)
    res.status(500).send({ err: 'Failed to get post' })
  }
}


async function addPost(req, res) {


  const { loggedinUser } = req
  // TODO:  VALIDATE POST FROM BODY
  try {
    console.log('loggedinUser:', loggedinUser)
    // const post = req.body
    // post.owner = loggedinUser
    // const addedPost = await PostService.add(post)
    // res.json(addedPost)
    res.end()
  } catch (err) {
    logger.error('Failed to add post', err)
    res.status(500).send({ err: 'Failed to add post' })
  }
}


async function updatePost(req, res) {
  try {
    const post = req.body
    const updatedPost = await PostService.update(post)
    res.json(updatedPost)
  } catch (err) {
    logger.error('Failed to update post', err)
    res.status(500).send({ err: 'Failed to update post' })

  }
}

async function removePost(req, res) {
  try {
    const PostId = req.params.id
    const removedId = await PostService.remove(PostId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove post', err)
    res.status(500).send({ err: 'Failed to remove post' })
  }
}

async function addPostComment(req, res) {
  const { loggedinUser } = req
  try {
    const PostId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await PostService.addPostComment(PostId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update post', err)
    res.status(500).send({ err: 'Failed to update post' })

  }
}

async function removePostMsg(req, res) {
  const { loggedinUser } = req
  try {
    const PostId = req.params.id
    const { msgId } = req.params

    const removedId = await PostService.removePostMsg(PostId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove post msg', err)
    res.status(500).send({ err: 'Failed to remove post msg' })

  }
}

module.exports = {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  removePost,
  addPostComment,
  removePostMsg
}
