const { Router } = require('express');
const router = new Router();
const AuthController = require('../controllers/auth-controller');
const VALIDATORS_MAP = require('../constants/validators');
const isAuth = require('../middleware/isAuth');

router.post('/login', [VALIDATORS_MAP.email, VALIDATORS_MAP.password], AuthController.login);

router.post(
  '/signup',
  [VALIDATORS_MAP.email, VALIDATORS_MAP.password, VALIDATORS_MAP.fullname],
  AuthController.signup,
);

router.get('/logout', AuthController.logout);

router.get('/refresh', AuthController.refreshToken);

router.post('/reset', [VALIDATORS_MAP.email], AuthController.resetPostPassword);

router.get('/reset/:token', AuthController.resetGetPassword);

router.patch('/reset-confirm', AuthController.resetPasswordConfirm)

router.get('/test', isAuth, (req, res) => {
  res.status(200).json({ a: 'work!!!' });
});

module.exports = router;
