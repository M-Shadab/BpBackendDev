const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 100 },
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
    { _id: this._id, email: this.email, name: this.name },
    config.get("jwtPrivateKey"),
    { expiresIn: "1h" }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

const validateUser = user => {
  const schema = Joi.object({
    name: Joi.string()
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

exports.User = User;
exports.validate = validateUser;
