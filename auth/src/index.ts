import mongoose from "mongoose";
import { app } from "./app";
const port = "3001";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined!");
  }
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("connected to DB");
  } catch (err) {
    console.log(err);
  }
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

start();
