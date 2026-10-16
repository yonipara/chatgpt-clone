const errorHandler = (err, req, res, next) => {
  //Any middleware with 4 parameters and the first parameter as error is treated as an error handler.
  if (err.status) {
    return res.status(err.status).json({ status: false, message: err.message });
  }
  return res.status(500).json({ status: false, message: err.message });
};

module.exports = errorHandler;

