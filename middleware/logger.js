const logger = (req, res, next) => {
  console.log("logger() activated...");
  next();
};

module.exports = logger;
