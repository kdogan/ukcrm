// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validierungsfehler',
      errors
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existiert bereits`
    });
  }

  // Mongoose Cast Error (ungültige ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Ungültige ID'
    });
  }

  // Default Error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Interner Serverfehler'
  });
};

module.exports = errorHandler;
