import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("returns 404 if the provided does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/courses/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "test",
      price: 20,
    })
    .expect(404);
});

it("returns 404 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/courses/${id}`)
    .send({
      title: "test",
      price: 20,
    })
    .expect(401);
});

it("returns 401 if the user does not own the course", async () => {
  const response = await request(app)
    .post("/api/courses")
    .set("Cookie", global.signin())
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/courses/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "test2",
      price: 22,
    })
    .expect(401);
});
it("returns 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/courses")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/courses/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/courses/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "test", price: -10 })
    .expect(400);
});

it("update the course provided valid input", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/courses")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/courses/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Hello", price: 100 })
    .expect(200);

  const courseResponse = await request(app)
    .get(`/api/courses/${response.body.id}`)
    .send();

  expect(courseResponse.body.title).toEqual("Hello");
  expect(courseResponse.body.price).toEqual(100);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/courses")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/courses/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Hello", price: 100 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
