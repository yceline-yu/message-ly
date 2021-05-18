"use strict";

const Router = require("express").Router;
const router = new Router();
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');
const Message = require('../models/message');
const { UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
    //will need to add conditional local to find out if curr logged in user matches the to/from username
    const id = req.params.id;

    const username = res.locals.user.username

    const message = await Message.get(id);

    if (username === message.to_user || username === message.from_user) {
        return res.json({ message });
    }
    throw new UnauthorizedError(`Invalid User`);

});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res, next){

    const {to_username, body} = req.body;

    const message = await Message.create({from_user:res.locals.user, to_username, body});

    return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next){

    const id = req.params.id;
    const username = res.locals.user.username;
    const messageInfo = await Message.get(id);

    if (username === messageInfo.to_user) {
        const message = await Message.markRead(id);
        return res.json({ message });
    }
    throw new UnauthorizedError(`Invalid User`);

});


module.exports = router;