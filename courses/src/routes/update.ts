import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from "@learngenering/common";
import { Course } from "../models/course";
import { CourseUpdatedPublisher } from "../events/publishers/course-updated";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/courses/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("price must greater than zero"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new NotFoundError();
    }

    if (course.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    course.set({
      title: req.body.title,
      price: req.body.price,
    });

    new CourseUpdatedPublisher(natsWrapper.client).publish({
      id: course.id,
      title: course.title,
      price: course.price,
      userId: course.userId,
    });

    await course.save();

    res.send(course);
  }
);

export { router as updateCourseRouter };
