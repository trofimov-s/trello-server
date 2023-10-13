const { validationResult } = require('express-validator');
const UserService = require('../services/user-service');

class AuthController {
  async signup(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    try {
      const { email, password, fullname } = req.body;

      const { refreshToken, ...rest } = await UserService.signup(email, password, fullname);
      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(201).json(rest);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { refreshToken, ...rest } = await UserService.login(email, password);
      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(200).json(rest);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      await UserService.logout(refreshToken);

      res.clearCookie('refreshToken');
      res.status(200).json({ status: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const { refreshToken: token, ...rest } = await UserService.refreshToken(refreshToken);
      res.cookie('refreshToken', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(201).json(rest);
    } catch (err) {
      next(err);
    }
  }

  async resetPostPassword(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    try {
      const { email } = req.body;

      await UserService.resetPassword(email);

      res.status(200).json({ status: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  }

  async resetGetPassword(req, res, next) {
    try {
      const { token } = req.params;
      console.log(token);

      const userId = await UserService.verifyResetPasswordToken(token);
      res.redirect(`${process.env.CLIENT_URL}/new-password/${token}/${userId}`);
    } catch (err) {
      next(err);
    }
  }

  async resetPasswordConfirm(req, res, next) {
    try {
      const { resetToken, userId, password, confirmPassword } = req.body;

      await UserService.updatePassword(resetToken, userId, password, confirmPassword);

      res.status(200).json({ status: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
