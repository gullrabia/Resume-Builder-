import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectDb from "./configs/db.js";
import userRouter from "./routes/userRouter.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRouter.js";

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(cors());

// route
app.get("/", (req, res) => {
  res.send("server is live");
});

app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)
// start server only after DB connects
const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server failed to start:", error.message);
  }
};

startServer();