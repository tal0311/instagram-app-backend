const authService = require('../api/auth/auth.service')
const asyncLocalStorage = require('../services/als.service')
const logger = require('./../services/logger.service')

// TODO: SET BETTER LOGIC HERE TO SUPPORT OTHER COOKIES
async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    if (!req.cookies.loginToken) return next()
    const loggedinUser = authService.validateToken(req.cookies.loginToken)

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.loggedinUser = loggedinUser
    }
    next()
  })
}

module.exports = setupAsyncLocalStorage

