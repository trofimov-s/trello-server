const UserModel = require('../models/user-model');
const TokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const bcrypt = require('bcrypt');
const MailerService = require('./mailer-service');

class UserService {
  async signup(email, password, fullname) {
    const candidate = await UserModel.findOne({ email });

    if (candidate) {
      const error = new Error('User already exist.');
      error.statusCode = 400;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, +process.env.SALT);
    const user = await UserModel.create({ email, password: hashPassword, fullname });
    const userDto = new UserDto(user);
    const tokenData = TokenService.generateTokens(userDto.email, userDto.id);

    await TokenService.saveToken(userDto.id, tokenData.refreshToken);

    return { ...tokenData, user: userDto };
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      const error = new Error(`User with email: ${email} not found`);
      error.statusCode = 400;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error(`Incorrect password`);
      error.statusCode = 400;
      throw error;
    }

    const userDto = new UserDto(user);
    const tokenData = TokenService.generateTokens(userDto.email, userDto.id);

    await TokenService.saveToken(userDto.id, tokenData.refreshToken);

    return { ...tokenData, user: userDto };
  }

  logout(refreshToken) {
    return TokenService.removeToken(refreshToken);
  }

  async refreshToken(token) {
    if (!token) {
      const error = new Error(`Not authorized`);
      error.statusCode = 401;
      throw error;
    }

    const userData = TokenService.validateRefreshToken(token);
    const tokenFromDB = TokenService.findToken(token);

    if (!userData || !tokenFromDB) {
      const error = new Error(`Not authorized`);
      error.statusCode = 401;
      throw error;
    }

    const user = await UserModel.findOne({ email: userData.email });
    const userDto = new UserDto(user);
    const tokenData = TokenService.generateTokens(userDto.email, userDto.id);

    await TokenService.saveToken(userDto.id, tokenData.refreshToken);

    return { ...tokenData, user: userDto };
  }

  async resetPassword(email) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      const error = new Error(`Not found user with email ${email}`);
      error.statusCode = 404;
      throw error;
    }

    const resetToken = await TokenService.generateResetPasswordToken();

    await MailerService.sendResetPasswordMail(email, resetToken);
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    return;
  }

  async verifyResetPasswordToken(token) {
    const user = await UserModel.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      const error = new Error(`Invalid token`);
      error.statusCode = 400;
      throw error;
    }

    return user._id.toString();
  }

  async updatePassword(resetToken, userId, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      const error = new Error("'Password' and 'ConfirmPassword' are not equals.");
      error.statusCode = 400;
      throw error;
    }

    const user = await UserModel.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId });
    console.log(user);
    if (!user) {
      const error = new Error("Invalid token");
      error.statusCode = 400;
      throw error;
    }

    const hashPassword = await bcrypt.hash(newPassword, +process.env.SALT);

    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    return;
  }
}

module.exports = new UserService();
