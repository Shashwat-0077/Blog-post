const Comment = require("../models/comments");

const isReviewAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment.user.equals(req.users)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect(`/blog/${id}`);
    }
    next();
};

module.exports = isReviewAuthor;
