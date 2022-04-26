import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/order";
import { Course } from "../../models/course";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the course does not exist", async () => {
  const courseId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId })
    .expect(404);
});

it("returns an error if the course is already reserved", async () => {
  const course = Course.build({
    title: "test",
    price: 20,
  });
  await course.save();
  const order = Order.build({
    userId: "1234",
    status: OrderStatus.Created,
    course,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId: course.id })
    .expect(400);
});

it("reserves a course", async () => {
  const course = Course.build({
    title: "test",
    price: 20,
  });
  await course.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId: course.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const course = Course.build({
    title: "test",
    price: 20,
  });
  await course.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId: course.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
