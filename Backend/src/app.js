import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5177,http://localhost:5178")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({
    limit: '10mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use(express.static('public'));
app.use(cookieParser());


// ROUTES:
import userRouter from './routes/user.routes.js'
app.use("/api/v1/users", userRouter)

import interviewRouter from './routes/interview.routes.js';
app.use("/api/v1/interview", interviewRouter)





app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
})

export default app;