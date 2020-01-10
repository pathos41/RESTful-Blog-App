const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require('express-session');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

const User = require("./models/user");
const Blog = require("./models/post");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Database connection
mongoose.connect("mongodb+srv://pathos41:letsgomavs41@pathos41-pc7te.mongodb.net/restful_blog_app?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}).then(() => {
	console.log("Connected to DB");
}).catch((err) => {
	console.log("Error: ", err.message);
});

// RESTful routes
app.get("/", (req, res) => {
	// console.log(req.user.username);
	res.redirect("/blogs");	
});

// Index route
app.get("/blogs", (req, res) => {
	Blog.find({}).sort('-created').exec((err, blogs) => {
		if(err){
			res.send(err);
		}else{
			res.render("index", {blogs: blogs, username: req.user});
		}
	});
});

// Show sign up form
app.get("/register", (req, res) => {
	res.render("register", {username: req.user});
});

// Handle user sign up
app.post("/register", (req, res) => {
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err){
			console.log(err);
			res.render("register", {username: req.user});
		}else{
			passport.authenticate("local")(req, res, () => {
				res.redirect("/");
			});
		}
	});
});

// Show the login form
app.get("/login", (req, res) => {
	res.render("login", {username: req.user});
});

// Handle user login
app.post("/login", passport.authenticate("local", {
	successRedirect: "/", 
	failureRedirect: "/login"
}), (req, res) => {
	
});

// Handle user logout
app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

// New post route
app.get("/blogs/new", isLoggedIn, (req, res) => {
	res.render("new", {username: req.user});
});

// Create route
app.post("/blogs", (req, res) => {
	// Sanitize the body, getting rid of any script tags inside
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// Set the author name to be the current user
	req.body.blog.author = req.user.username;
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err){
			res.render("new", {username: req.user});
		}else{
			res.redirect("/blogs");
		}
	});
});

// Show route
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog, username: req.user});
		}
	});
});

// Edit route
app.get("/blogs/:id/edit", isLoggedIn, (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog, username: req.user});
		}
	});
});

// Update route
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect(`/blogs/${req.params.id}`);
		}
	});
});

// Delete route
app.delete("/blogs/:id", isLoggedIn, (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

// Get all the articles of a specific author
app.get("/blogs/articles/:author", (req, res) => {
	Blog.find({author: req.params.author}, (err, foundBlog) => {
		if(err){
			res.send(err);
		}else{
			res.render("articles", {
				author: req.params.author, 
				blogs: foundBlog, 
				username: req.user
			});
		}
	});
});

// Design the middleware to check if a user is logged in
function isLoggedIn(req, res, next){
	if(req.user){
		next();
	}else{
		res.redirect("/login");
	}
}

// App listens to port 3000
app.listen(3000, () => {
	console.log("Server is up and running!");
});