import request from "supertest";
import { app } from "../../app";

const createCourse = () => {
  return request(app).post("/api/courses").set("Cookie", global.signin()).send({
    title: "asldkf",
    price: 20,
  });
};

it("can fetch a list of courses", async () => {
  await createCourse();
  await createCourse();
  await createCourse();

  const response = await request(app).get("/api/courses").send().expect(200);

  expect(response.body.length).toEqual(3);
});
