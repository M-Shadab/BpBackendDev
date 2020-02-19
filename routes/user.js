const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { User, validateRegister, validateLogin } = require("../models/user");

router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    res.send(token);
  } catch (ex) {
    console.log(ex);
    res.status(400).send(ex);
  }
});

router.post("/register", async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, email, password } = req.body;

  try {
    const resultUser = await User.findOne({ email });
    if (resultUser) return res.status(400).send("user already existed");

    const user = new User({ firstName, lastName, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const resultSave = await user.save();
    const token = user.generateAuthToken();

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(resultSave, ["firstName", "lastName", "email", "_id"]));
  } catch (ex) {
    console.log(ex);
    res.status(400).send(ex);
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

module.exports = router;
