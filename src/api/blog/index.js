import express from "express";
import postsModel from "./model.js";
import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js";

const postsRouter = express.Router();

// Require authentication for POST, PUT, and DELETE endpoints
const authMiddleware = (req, res, next) => {
  if (
    req.method === "POST" ||
    req.method === "PUT" ||
    req.method === "DELETE"
  ) {
    basicAuthMiddleware(req, res, next);
  } else {
    next();
  }
};
postsRouter.use(authMiddleware);

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new postsModel({
      ...req.body,
      user: [req.user._id, ...req.body.user],
    });
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await postsModel.find();
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const post = await postsModel.findOne({
      _id: req.params.postId,
      user: req.user._id,
    });
    if (post) {
      res.send(post);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatedPost = await postsModel.findOneAndUpdate(
      { _id: req.params.postId, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletedPost = await postsModel.findOneAndDelete({
      _id: req.params.postId,
      user: req.user._id,
    });
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// ADDS THE /me/stories ENDPOINT - retrieving all the posts from the authenticated user

postsRouter.get("/me/stories", basicAuthMiddleware, async (req, res, next) => {
  try {
    const posts = await postsModel.find({ user: req.user._id });
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
