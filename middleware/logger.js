const Log = require('../utils/logger');

const logger = async (req, res, next) => {
  await Log("backend", "info", "middleware", `Incoming request: ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
