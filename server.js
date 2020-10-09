"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "./views/pug");

let session = require("express-session");
let passport = require("passport");
let ObjectId = require("mongodb");
let mongo = require("mongodb").MongoClient;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

myDB(async (client) => {
  const MyDatabase = await client.db("FCC").collection("user");

  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
    });
  });

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Retrieve User details from cookie
  passport.deserializeUser((userId, done) => {
    MyDatabase.findOne({ _id: new ObjectId(userId) }, (err, doc) => {
      done(null, doc);
    });
  });
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: e, message: "Unable to login" });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
  console.log("Successful database connection");
});
