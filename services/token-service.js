const TokenModel = require('../models/token-model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokensService {
  generateTokens(email, userId) {
    const accessToken = jwt.sign({ email, userId }, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ email, userId }, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async generateResetPasswordToken() {
    const token = crypto.randomBytes(32).toString('hex');

    return token;
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;

      return tokenData.save();
    }

    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken) {
    const tokenData = await TokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken) {
    const tokenData = await TokenModel.findOne({ refreshToken });
    return tokenData;
  }

  validateRefreshToken(token) {
    try {
      const data = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

      return data;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokensService();
