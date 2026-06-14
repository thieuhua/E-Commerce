const { ApiError } = require('../utils/apiError');

// Usage: router.post('/path', validate(schema), controller)
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    throw ApiError.badRequest('Validation failed', errors);
  }
  req[source] = value; // replace with sanitized value
  next();
};

module.exports = validate;
