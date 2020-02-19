const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
  lastName: { type: String, required: true, minlength: 3, maxlength: 100 },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100
    // unique: true
  }
});

// userSchema.methods.generateAuthToken = () => {
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    },
    config.get("jwtPrivateKey"),
    { expiresIn: "1h" }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const validateRegister = user => {
  const schema = Joi.object({
    firstName: Joi.string()
      .required()
      .min(3)
      .max(100),
    lastName: Joi.string()
      .required()
      .min(3)
      .max(100),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(5)
      .max(100)
  });

  return schema.validate(user);
};

const validateLogin = req => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(5)
      .max(100)
  });

  return schema.validate(req);
};

exports.User = User;
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
