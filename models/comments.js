const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    body: String,
    editedAt: Date,
});

const Comments = mongoose.model("Comment", commentSchema);

module.exports = Comments;
