const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        console.log(req.headers.authorization)
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new Error('Authentication faild!')
        }
        const decodedToken = jwt.verify(token, 'user_token_secret')
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (err) {
        const error = new HttpError('Authentication failed!', 403)
        return next(error)
    }
}