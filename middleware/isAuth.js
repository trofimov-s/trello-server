const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authorized.');
    error.statusCode = 401;
    throw error;
  }

  try {
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      const error = new Error('Not authorized.');
      error.statusCode = 401;
      throw error;
    }

    const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);

    if (!userData) {
      const error = new Error('Not authorized.');
      error.statusCode = 401;
      throw error;
    }

    req.userId = userData.userId;

    next();
  } catch (err) {
    const error = new Error('Not authorized.');
    error.statusCode = 401;
    next(error);
  }
};
