"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");

const User = require("../models/user")
const { UnauthorizedError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next){

    const {username, password} = req.body;
    const isAuthenticated = await User.authenticate(username, password);

    if ( isAuthenticated === true) {
        let token = jwt.sign({username}, SECRET_KEY);
        // await User.updateLoginTimestamp(username); TODO: needed here or not?
        return res.json({token});
    }
    throw new UnauthorizedError('Invalid user/password');
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next){
    const { username, password, first_name, last_name, phone } = req.body;
    await User.register(req.body)
    let token = jwt.sign({username}, SECRET_KEY);
    // await User.updateLoginTimestamp(username); TODO needed here or not?
    return res.json({token});
})

module.exports = router;