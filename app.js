if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
// Moved requires to other routers
// const { campgroundSchema, reviewSchema } = require("./schemas.js");
// const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
// Moved requires to other routers
// const Campground = require("./models/campground");
// const Review = require("./models/review");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user");

// Route requires
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/compass-camp"),
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // Used to be necessary to get rid of a depracation warning
    // useFindAndModify: false
  };

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected...");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// Used to tell express to serve a dir
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    // Set to true by default, even without this property added
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Session must be used before 'passport.session'
app.use(session(sessionConfig));
app.use(flash());

// Using Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

// Methods for storing and unstoring Users using mongoose passport plugin
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Initial user creation test
// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "fakeuser@gmail.com", username: "fakeuser" });
//   const newUser = await User.register(user, "chicken");
//   res.send(newUser);
// });

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// ***Initial db save***
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({ title: "My Backyard", description: "Cheap camping!" });
//   await camp.save();
//   res.send(camp);
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode);
  res.render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000...");
});
