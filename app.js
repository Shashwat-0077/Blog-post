if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const Blog = require("./models/BlogSchema");
const Comment = require("./models/comments");
const User = require("./models/User");

const escapeRegex = require("./utils/escapeRegex");
const detectError = require("./utils/detectError");

const isLoggedIn = require("./middleware/isLoggedIn");
const checkReturnTo = require("./middleware/checkReturnTo");
const isAuthor = require("./middleware/isAuthor");
const isReviewAuthor = require("./middleware/reviewAuth");

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");
// locus  <---------------------------------------------------------- very good for debugging in node.js

mongoose
    .connect("mongodb://localhost:27017/BlogPost")
    .then(() => {
        console.log("DB is connected");
    })
    .catch((err) => {
        console.log("ERROR : ", err);
    });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/static")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.MySecretKey,
        saveUninitialized: true,
        resave: false,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: "strict",
        },
    })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.deleted = req.flash("deleted");
    res.locals.edited = req.flash("edited");

    res.locals.currentUser = req.user;

    next();
});

app.get(
    "/",
    detectError(async (req, res) => {
        let { sort, search } = req.query;

        if (!search) search = "";
        if (search.constructor === Array) search = search[0];

        const regex = new RegExp(escapeRegex(search), "gi");
        let blogs;

        if (sort === "date") {
            blogs = await Blog.find({ title: regex })
                .sort({ createdAt: 1 })
                .populate("author");
        } else if (sort === "likes") {
            blogs = await Blog.find({ title: regex })
                .sort({ likes: 1 })
                .populate("author");
        } else if (sort === "title") {
            blogs = await Blog.find({ title: regex })
                .sort({ title: 1 })
                .populate("author");
        } else {
            blogs = await Blog.find({ title: regex }).populate("author");
        }

        res.render("index", { blogs: blogs });
    })
);

app.get("/register", (req, res) => {
    res.render("register");
});

app.post(
    "/register",
    detectError(async (req, res, next) => {
        try {
            const { user, password } = req.body;
            let newUser = new User(user);
            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser, (err) => {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("/register");
                }
                req.flash("success", "Welcome to the BlogPost");
                res.redirect("/");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    })
);

app.get("/login", (req, res, next) => {
    res.render("login");
});

app.post(
    "/login",
    checkReturnTo,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res, next) => {
        req.flash("success", "Welcome Back");
        const redirectUrl = res.locals.returnTo || "/";
        res.redirect(redirectUrl);
    }
);

app.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            req.flash(
                "error",
                "please try again , if nothing happens please try to contact us via example@gmail.com"
            );
        } else {
            req.flash("success", "GoodBye ! see you again soon");
        }
        res.redirect("/");
    });
});

app.get(
    "/new",
    isLoggedIn,
    detectError(async (req, res) => {
        let blog = req.session.blogData;
        req.session.blogData = null;

        res.render("newBlog", { blog: blog });
    })
);

app.post(
    "/new",
    isLoggedIn,
    detectError(async (req, res) => {
        const { blog } = req.body;

        const newBlog = new Blog(blog);
        newBlog.author = req.user;
        newBlog.likes = 0;
        newBlog.save();
        res.redirect("/");
    })
);

app.get(
    "/blog/:id",
    detectError(async (req, res) => {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate([
            {
                path: "comments",
                populate: {
                    path: "user",
                },
            },
            {
                path: "author",
            },
        ]);
        res.render("blog", { blog: blog });
    })
);

app.delete(
    "/blog/:id",
    isLoggedIn,
    isAuthor,
    detectError(async (req, res) => {
        await Blog.findByIdAndDelete(req.params.id);
        req.flash("deleted", "Blog has been deleted");
        res.redirect("/");
    })
);

app.get(
    "/blog/:id/edit",
    isLoggedIn,
    isAuthor,
    detectError(async (req, res) => {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            req.flash("error", "sorry could not find that blog post");
            return res.redirect("/");
        }
        res.render("edit", { blog: blog });
    })
);

app.put(
    "/blog/:id/edit",
    isLoggedIn,
    isAuthor,
    detectError(async (req, res, next) => {
        let blog = await Blog.findByIdAndUpdate(req.params.id, req.body.blog);
        await blog.save();
        req.flash("edited", "Blog has been edited");
        res.redirect(`/blog/${req.params.id}`);
    })
);

//comments
app.post(
    "/blog/:id/comment/new",
    isLoggedIn,
    detectError(async (req, res) => {
        let blog = await Blog.findById(req.params.id);
        const comment = new Comment(req.body.comment);
        comment.user = req.user;
        comment.editedAt = new Date();
        blog.comments.push(comment);

        await comment.save();
        await blog.save();
        res.redirect(`/blog/${req.params.id}`);
    })
);

app.post(
    "/blog/:id/:commentId/delete",
    isLoggedIn,
    isReviewAuthor,
    detectError(async (req, res) => {
        const { id, commentId } = req.params;
        await Blog.findByIdAndUpdate(id, {
            $pull: { comments: commentId },
        });
        await Comment.findByIdAndDelete(commentId);
        res.redirect(`/blog/${id}`);
    })
);

app.use((err, req, res, next) => {
    const { status = 500, message = "something went wrong", stack } = err;
    console.log(
        `---------------status-----------------\n${status}\n\n
---------------Message----------------\n${message}\n\n
---------------Stack------------------\n${stack}`
    );

    res.status(status).render("something-went-wrong", err);
});

app.all("*", (req, res) => {
    res.status(404).render("404_page");
});

app.listen(80, () => {
    console.log("Meet you at 80");
});
