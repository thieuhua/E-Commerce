const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Created') =>
  success(res, data, message, 201);

const paginated = (res, data, pagination) =>
  res.status(200).json({ success: true, data, pagination });

module.exports = { success, created, paginated };
