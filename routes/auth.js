"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user")
const { UnauthorizedError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next){
    const {username, password} = req.body;
    if (User.authenticate(username, password)) {
        let token = jwt.sign({username}, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({token});
    }
    throw new UnauthorizedError('Invalid user/password');
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;