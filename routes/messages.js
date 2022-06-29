const Router = require('express').Router;
const router = new Router();
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const Message = require('../models/message');
const ExpressError = require('../expressError');
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureCorrectUser, async function(req, res, next) {
	try {
		const message = await Message.get(req.params.id);
		return res.json({ message });
	} catch (e) {
		return next(e);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		let from_user = req.user.username;
		let { to_user, body } = req.body;
		if (!to_user || !body) {
			throw new ExpressError('Missing message parameters', 400);
		}
		const message = await Message.create(from_user, to_user, body);
		return res.json({ message });
	} catch (e) {
		return next(e);
	}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureCorrectUser, async function(req, res, next) {
	try {
		let result = await Message.markRead(req.params.id);
		return res.json({ result });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
