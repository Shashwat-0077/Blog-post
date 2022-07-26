const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    company: {
        type: String,
        default: "none",
    },
    post: {
        type: String,
        default: "none",
    },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);

module.exports = User;
