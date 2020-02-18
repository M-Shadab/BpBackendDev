const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const { User, validate } = require("../models/user");

// router.post("/", auth, async (req, res) => {
router.post("/register", async (req, res) => {
  console.log("req-body: ", req.body);

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, email, password } = req.body;

  try {
    const resultUser = await User.findOne({ email });
    if (resultUser) return res.status(400).send("user already existed");

    const user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const resultSave = await user.save();
    // const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
    const token = user.generateAuthToken();

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(resultSave, ["name", "email", "_id"]));
  } catch (ex) {
    console.log(ex);
    res.status(400).send(ex);
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
  //   res.send("user");
});

module.exports = router;
