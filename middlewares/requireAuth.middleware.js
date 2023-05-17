const authService = require('../api/auth/auth.service')
const logger = require('../services/logger.service')
const config = require('../config')
const asyncLocalStorage = require('../services/als.service')
const postService = require('../api/post/post.service')

function requireAuth(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  console.log('loggedinUser', loggedinUser);
  logger.debug('MIDDLEWARE', loggedinUser)

  // TODO: support gust mode
  // if (config.isGuestMode && !loggedinUser) {
  //   req.loggedinUser = { _id: '', fullname: 'Guest' }
  //   return next()
  // }
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  req.loggedinUser = loggedinUser
  next()
}

function requireAdmin(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  if (!loggedinUser.isAdmin) {
    logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}

async function requireOwner(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  const post = await postService.getById(req.params.id)
  if (loggedinUser._id !== post.by._id) {
    logger.warn(loggedinUser.fullname + 'attempted to perform owner action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}


// module.exports = requireAuth

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwner
}
