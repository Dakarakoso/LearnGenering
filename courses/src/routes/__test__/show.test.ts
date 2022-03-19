import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the course is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/courses/${id}`).send().expect(404);
});

it("returns the course if the course is found", async () => {
  const title = "concert";
  const price = 20;

  const response = await request(app)
    .post("/api/courses")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const courseResponse = await request(app)
    .get(`/api/courses/${response.body.id}`)
    .send()
    .expect(200);

  expect(courseResponse.body.title).toEqual(title);
  expect(courseResponse.body.price).toEqual(price);
});
