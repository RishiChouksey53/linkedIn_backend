import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import mainRoutes from "./routes/main.router.js";

const app = express();

app.set("port", process.env.PORT || 9090);

app.use(cors());
app.use(express.json());
app.use("/", mainRoutes);
app.use(express.static("uploads")); //relative path

const start = async () => {
  try {
    const connectDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to DB host: ${connectDB.connection.host}`);
    app.listen(app.get("port"), () => {
      console.log(`Listening on port: ${app.get("port")}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed: ", error);
    process.exit(1);
  }
};

start();
