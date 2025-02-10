import User from "../models/user.model.js";
export const getUserSavedPosts = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ clerkUserId });
    const savedPosts = user.savedPosts;
    return res.status(200).json(savedPosts);
  } catch (error) {
    res.status(500).json(error.message);
  } 
};

export const savePost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ clerkUserId });
    const isSaved = user.savedPosts.includes(postId);
    if (!isSaved) {
      await User.findByIdAndUpdate(user._id, {
        $push: { savedPosts: postId },
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $pull: { savedPosts: postId },
      });
    }
   
    setTimeout(() => {
      return res
        .status(200)
        .json({ message: isSaved ? "Post unsaved" : "Post saved" });
    }, 3000);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
