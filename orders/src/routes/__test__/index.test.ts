import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Course } from "../../models/course";
import mongoose from "mongoose";

const buildCourse = async () => {
  const course = Course.build({
    title: "test",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await course.save();
  return course;
};

it("fetches orders for an particular user", async () => {
  // Create three courses
  const courseOne = await buildCourse();
  const courseTwo = await buildCourse();
  const courseThree = await buildCourse();

  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as User #1
  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ courseId: courseOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ courseId: courseTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ courseId: courseThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].course.id).toEqual(courseTwo.id);
  expect(response.body[1].course.id).toEqual(courseThree.id);
});
