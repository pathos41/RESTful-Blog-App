const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// App config, fill in the username and password
mongoose.connect("mongodb+srv://<username>:<password>@pathos41-pc7te.mongodb.net/test?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}).then(() => {
	console.log("Connected to DB");
}).catch((err) => {
	console.log("Error: ", err.message);
});

// Mongoose model config
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {
		type: Date,
		default: Date.now
	}
});
let Blog = mongoose.model("Blog", blogSchema);

// RESTful routes
app.get("/", (req, res) => {
	res.redirect("/blogs");	
});

// Index route
app.get("/blogs", (req, res) => {
	Blog.find({}).sort('-created').exec((err, blogs) => {
		if(err){
			res.send("Something is wrong!");
		}else{
			res.render("index", {blogs: blogs});
		}
	});
});

// New route
app.get("/blogs/new", (req, res) => {
	res.render("new");
});

// Create route
app.post("/blogs", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err){
			res.render("new");
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
			res.render("show", {blog: foundBlog});
		}
	});
});

// Edit route
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog});
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
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

// App listens to port 3000
app.listen(3000, () => {
	console.log("Server is up and running!");
});