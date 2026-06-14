const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { verifyToken } = require('../../middlewares/auth');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.schema');

router.post('/register', validate(registerSchema), controller.register);
router.post('/login',    validate(loginSchema),    controller.login);
router.post('/refresh',  validate(refreshSchema),  controller.refresh);
router.post('/logout',   verifyToken,              controller.logout);
router.get('/me',        verifyToken,              controller.me);

module.exports = router;
