import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Course } from "../../models/course";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the Course does not exist", async () => {
  const courseId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId })
    .expect(404);
});

it("returns an error if the Course is already reserved", async () => {
  const course = Course.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await course.save();
  const order = Order.build({
    course,
    userId: "laskdflkajsdf",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ courseId: course.id })
    .expect(400);
});

it("reserves a Course", async () => {
  const course = Course.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
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
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
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
