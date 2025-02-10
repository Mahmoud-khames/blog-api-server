import ImageKit from "imagekit";
import postsModel from "../models/post.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();
const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});
export const getPosts = async (req, res) => {
  try {
   const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  const query = {};

  console.log(req.query);

  const cat = req.query.cat;
  const author = req.query.author;
  const searchQuery = req.query.search;
  const sortQuery = req.query.sort;
  const featured = req.query.featured;

  if (cat) {
    query.category = cat;
  }

  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }

  if (author) {
    const user = await User.findOne({ username: author }).select("_id");

    if (!user) {
      return res.status(404).json("No post found!");
    }

    query.user = user._id;
  }

  let sortObj = { createdAt: -1 };

  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { visit: -1 };
        break;
      case "trending":
        sortObj = { visit: -1 };
        query.createdAt = {
          $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      default:
        break;
    }
  }

  if (featured) {
    query.isFeatured = true;
  }

  const posts = await postsModel.find(query)
    .populate("user", "username")
    .sort(sortObj)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await postsModel.countDocuments();
  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
  } catch (error) {
    res.status(500).json(error);
  }
};
export const getPost = async (req, res) => {
  try {
    const post = await postsModel
      .findOne({ slug: req.params.slug })
      .populate("user", "username img");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const createPost = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ clerkUserId });
    let slug = req.body.title.replace(/ /g, "-").toLowerCase();
    let existingPost = await postsModel.findOne({ slug });
    let counter = 2;
    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await postsModel.findOne({ slug });
      counter++;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new postsModel({ user: user._id, slug, ...req.body });
    const post = await newPost.save();
    return res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
export const deletePost = async (req, res, next) => {
  const clerkUserId = req.auth.userId;
  console.log(clerkUserId);
  if (!clerkUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const role = req.auth.sessionClaims.metadata.role || "user";
  if (role === "admin") {
    await postsModel.findOneAndDelete({ _id: req.params.id });
    return res.status(200).json({ message: "Post has been deleted" });
  }
  const user = await User.findOne({ clerkUserId });

  const deletePost = await postsModel.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });
  if (!deletePost) {
    return res.status(404).json({ message: "Post not found" });
  }
  return res.status(200).json({ message: "Post has been deleted" });
};
export const featurePost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";
    if (role !== "admin") {
      return res.status(403).json("You cannot feature posts!");
    }

    const post = await postsModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isFeature = post.isFeatured;
    const updatedPost = await postsModel.findByIdAndUpdate(
      postId,
      {
        isFeatured: !isFeature,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ updatedPost });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const uploadAuth = async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};
