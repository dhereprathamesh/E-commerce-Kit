const Joi = require('joi')

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false })
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    })
  }
  next()
}

const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, number, and special character'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    // code: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match' })
  }),

  createRole: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional()
  }),

  assignRole: Joi.object({
    userId: Joi.string().uuid().required(),
    roleId: Joi.string().uuid().required()
  }),

  removeRole: Joi.object({
    userId: Joi.string().uuid().required(),
    roleId: Joi.string().uuid().required()
  })
}

const validateProduct = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
  };
};

module.exports = { validate, schemas, validateProduct }

// module.exports = validate;


