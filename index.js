import express from "express";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./routes/user.route.js";
import postsRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webHookRouter from "./routes/webHook.route.js";
import connectDB from "./lib/connectDb.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3001;
app.use(cors(process.env.CLERK_FRONTEND_API));
app.use("/webhooks", webHookRouter);
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(clerkMiddleware());
app.use("/users", userRouter); 
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);

app.use((error, req, res, next) => {
  res.status(500);
  res.json({
    message: error.message || "An unknown error occured",
    status: error.status || 500,
    stack: error.stack,
  });
});
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from the backend server",
  });
})
app.listen(port, () => {
  connectDB();
  console.log("Server is running ");
});


export default app;