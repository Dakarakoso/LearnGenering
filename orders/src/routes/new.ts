import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@learngenering/common";
import { body } from "express-validator";
import { Course } from "../models/course";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("courseId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("CourseId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { courseId } = req.body;

    // Find the course the user is trying to order in the database
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError();
    }

    // Make sure that this course is not already reserved
    const isReserved = await course.isReserved();
    if (isReserved) {
      throw new BadRequestError("course is already reserved");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      course,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      course: {
        id: course.id,
        price: course.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
