const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");

const { User } = require("../models/user");

const validate = req => {
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

router.post("/", async (req, res) => {
  console.log("req: ", req.body);
  const { error } = validate(req.body);
  console.log("err", error);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    // res.send(_.pick(user, ["_id", "name", "email"]));
    res.send(token);
  } catch (ex) {
    console.log(ex);
    res.status(400).send(ex);
  }
});

module.exports = router;
