import express from "express";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./routes/user.route.js";
import postsRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webHookRouter from "./routes/webHook.route.js";
import connectDb from "./lib/connectDB.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;
app.use(cors(
    {
  origin: process.env.CLERK_FRONTEND_API,
  // origin: " http://localhost:5173",
   credentials:true, 
}
));
app.use("/webhooks", webHookRouter);
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
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

app.listen(port, () => {
  connectDb();
  console.log("Server is running ");
});

export default app;
