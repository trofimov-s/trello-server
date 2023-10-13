const { body } = require('express-validator');

const VALIDATORS_MAP = {
  email: body('email').isEmail().withMessage('Invalid email'),
  password: body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password lenght should be at least 8 characters'),
  fullname: body('fullname')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Fullname should be at least 2 characters'),
};

module.exports = VALIDATORS_MAP;
