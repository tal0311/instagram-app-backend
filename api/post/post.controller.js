const postService = require('./post.service.js')
const logger = require('../../services/logger.service.js')
const { getByUsername } = require('../user/user.service.js')

async function getPosts(req, res) {
  try {
    logger.info('Getting Posts')
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
    const postId = req.params.id
    const post = await postService.getById(postId)

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

async function addPostLike(req, res) {
  const { id } = req.params
  let { loggedinUser } = req
  if (!loggedinUser) {
    loggedinUser = {
      imgUrl:
        "https://res.cloudinary.com/tal-amit-dev/image/upload/v1679772900/Instagram/WhatsApp_Image_2023-03-25_at_22.22.51_1_va5b7q.jpg",
      _id: "643d2a0f99553dc5ce88b861",
      fullname: "Tal Amit",
      username: "tal.amit"
    }
  }
  console.log('loggedinUser', loggedinUser)
  console.log('id', id)
  try {
    const updatedPost = await postService.addPostLike(id, loggedinUser)
    res.json(updatedPost)
  }
  catch (err) {
    logger.error('Failed to update post', err)
    res.status(500).send({ err: 'Failed to update post' })
  }

}


module.exports = {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  removePost,
  addPostComment,
  addPostLike
}
