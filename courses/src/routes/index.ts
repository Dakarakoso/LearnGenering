import express, { Request, Response } from "express";
import { Course } from "../models/course";

const router = express.Router();

router.get("/api/courses", async (req: Request, res: Response) => {
  const courses = await Course.find({});
  res.send(courses);
});

export { router as indexCourseRouter };
