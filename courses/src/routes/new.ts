import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@learngenering/common";
import { Course } from "../models/course";
import { CourseCreatedPublisher } from "../events/publishers/course-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/courses",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const course = Course.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await course.save();
    await new CourseCreatedPublisher(natsWrapper.client).publish({
      id: course.id,
      version: course.version,
      title: course.title,
      price: course.price,
      userId: course.userId,
    });

    res.status(201).send(course);
  }
);

export { router as createCourseRouter };
