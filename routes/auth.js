"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");
const { BadRequestError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next){

    const {username, password} = req.body;
    const isAuthenticated = await User.authenticate(username, password);

    if ( isAuthenticated === true) {
        const token = jwt.sign({username}, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({token});
    }
    //Unauthorized would be more fitting (look at test)
    throw new BadRequestError('Invalid user/password');
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next){

    const { username } = req.body;
    await User.register(req.body);

    const token = jwt.sign({username}, SECRET_KEY);
    User.updateLoginTimestamp(username);

    return res.json({token});
});

module.exports = router;