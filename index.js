const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();
const logger = require("./middleware/logger");
const products = require("./routes/products");
const user = require("./routes/user");
const auth = require("./routes/login");
const home = require("./routes/home");
const mongoose = require("mongoose");
const _ = require("lodash");
const cors = require("cors");

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL_ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

// const uri = "mongodb+srv://user1:BlockUser@cluster0-i1zvw.mongodb.net/test?retryWrites=true&w=majority";
if (app.get("env") === "production") console.log("DB-URI: ", config.get("db"));
if (app.get("env") === "development") console.log("DB: ", config.get("db"));

mongoose
  .connect(config.get("db"), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("mongodb connected..."))
  .catch(err => console.log("mongodb is not connected.", err));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(logger);

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
}

app.use("/", home);
app.use("/api/products", products);
app.use("/api/user", user);
app.use("/api/login", auth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server started at ${PORT}...`));
