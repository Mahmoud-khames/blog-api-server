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

// Debug: Log the environment variable
console.log('CLERK_FRONTEND_API:', JSON.stringify(process.env.CLERK_FRONTEND_API));

// Updated CORS configuration
const corsOptions = {
  origin: [
    'https://blog-client-server-icb4.vercel.app',
    // 'http://localhost:3000',
    'http://localhost:5173' // Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Requested-With'
  ]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use("/webhooks", webHookRouter);
app.use(express.json());

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
  res.send("Hello World!");
});

app.listen(port || 3001, () => {
  connectDb();
  console.log("Server is running");
});

export default app;