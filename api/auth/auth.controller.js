const authService = require('./auth.service')
const logger = require('../../services/logger.service')

// TODO: make sure passwords are not logged or getting to the FE
async function login(req, res) {
    const { username, password } = req.body


    try {
        const user = await authService.login(username, password)
        logger.debug('user from login:', user)
        const loginToken = authService.getLoginToken(user)
        const isSecure = process.env.NODE_ENV === 'production' ? true : false
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)

    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    try {
        const credentials = req.body
        const account = await authService.signup(credentials)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(credentials.username, credentials.password)
        logger.info('User signup:', user)
        const loginToken = authService.getLoginToken(user)
        const isSecure = process.env.NODE_ENV === 'production' ? true : false
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}