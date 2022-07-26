const Blog = require("../models/BlogSchema");

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog.author.equals(req.user)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect(`/blog/${id}`);
    }
    next();
};

module.exports = isAuthor;
