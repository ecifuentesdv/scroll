const user = require('./user');
const customLimiter = require('./customLimitter');
const validations = require('./validations');
const validateJWT = require('./validateJWT');
const moneythor = require('./moneyThor');
const webview = require('./validacionesWebView');
const producto = require('./producto');

module.exports = {
    ...user,
    ...customLimiter,
    ...validations,
    ...validateJWT,
    ...moneythor,
    ...webview,
    ...producto
}