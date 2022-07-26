const mongoose = require("mongoose");
const Comments = require("./comments");

const blogSchema = new mongoose.Schema(
    {
        title: String,
        summary: String,
        body: String,
        likes: Number,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
    },
    {
        timestamps: true,
    }
);

blogSchema.post("findOneAndDelete", async function (data) {
    if (data) {
        await Comments.deleteMany({ id: { $in: data.comments } });
    }
});

const Blog = mongoose.model("blog", blogSchema);

module.exports = Blog;
