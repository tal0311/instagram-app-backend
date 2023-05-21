const postService = require('./post.service.js')
const logger = require('../../services/logger.service.js')
const { getByUsername } = require('../user/user.service.js')

async function getPosts(req, res) {
  try {
    logger.debug('Getting Posts')

    const filterBy = {
      txt: req.query.txt || '',
      userFilter: req.query.userFilter || '',
      userId: req.query.userId || ''
    }
    const posts = await postService.query(filterBy)
    res.json(posts)
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

    const { _id, username, imgUrl, fullname } = loggedinUser
    const by = {
      _id,
      username,
      imgUrl,
      fullname
    }
    const post = req.body
    post.by = by
    const addedPost = await postService.add(post)
    res.json(addedPost)
    // res.end()
  } catch (err) {
    logger.error('Failed to add post', err)
    res.status(500).send({ err: 'Failed to add post' })
  }
}


async function updatePost(req, res) {
  try {
    const post = req.body
    const updatedPost = await postService.update(post)
    res.json(updatedPost)
  } catch (err) {
    logger.error('Failed to update post', err)
    res.status(500).send({ err: 'Failed to update post' })

  }
}

async function removePost(req, res) {
  try {
    const postId = req.params.id
    const removedId = await postService.remove(postId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove post', err)
    res.status(401).send({ err: 'Unauthorized' })

  }
}

async function addPostComment(req, res) {
  const { loggedinUser } = req

  try {
    const postId = req.params.id
    const { txt } = req.body
    const comment = {
      txt,
      by: loggedinUser
    }


    const updatedPost = await postService.addPostComment(postId, comment)
    res.json(updatedPost)

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

    const removedId = await postService.removePostMsg(PostId, msgId)
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
