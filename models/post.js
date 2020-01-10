const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {
		type: Date,
		default: Date.now
	},
	author: String
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;