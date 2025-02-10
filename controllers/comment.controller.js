import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username img")
      .sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addComment = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.params.postId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ clerkUserId });

    const newComment = new Comment({
      user: user._id,
      post: postId,
      ...req.body,
    });
    const comment = await newComment.save();
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const id = req.params.id;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const role = req.auth.sessionClaims.metadata.role || "user";
    if (role === "admin") {
      await Comment.findOneAndDelete({ _id: req.params.id });
      return res.status(200).json({ message: "Comment has been deleted" });
    }
    const user = await User.findOne({ clerkUserId });
    const deleteComment = await Comment.findOneAndDelete({
      _id: id,
      user: user._id,
    });
    if (!deleteComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment has been deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};
