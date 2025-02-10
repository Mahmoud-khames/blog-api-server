import { Webhook } from "svix";
import User from "../models/user.model.js";
import postModel from "../models/post.model.js";
import Comment from "../models/comment.model.js";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.Clerk_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: "Webhook secret not found" });
  }
  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    res.status(400).json({});
  }

  console.log(evt.data);
  if (evt.type === "user.created") {
    const newUser = new User({
      clerkUserId: evt.data.id,
      username: evt.data.username || evt.data.email_addresses[0].email_address,
      email: evt.data.email_addresses[0].email_address,
      img: evt.data.profile_image_url,
    });
    await newUser.save();
  }
  if (evt.type === "user.updated") {
    const user = await User.findOne({ clerkUserId: evt.data.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username =
      evt.data.username || evt.data.email_addresses[0].email_address;
    user.email = evt.data.email_addresses[0].email_address;
    user.img = evt.data.profile_image_url;
    await user.save();
  }
  if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkUserId: evt.data.id,
    });

    await postModel.deleteMany({user:deletedUser._id})
    await Comment.deleteMany({user:deletedUser._id})
  }

  return res.status(200).json({
    message: "Webhook received",
  }); 
};
 