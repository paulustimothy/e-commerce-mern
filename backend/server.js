import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({limit: "5mb"})); // req.body
app.use(express.urlencoded({extended: true})); // to parse form data
app.use(cookieParser()); // req.cookies

app.use("/api/auth", authRoutes);   

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
