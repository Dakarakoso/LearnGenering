import request from "supertest";
import { app } from "../../app";
import { Course } from "../../models/course";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as cancelled", async () => {
  //create a course with course model
  const course = Course.build({
    title: "test",
    price: 20,
  });
  await course.save();
  const user = global.signin();
  //make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ courseId: course.id })
    .expect(201);
  // make a request to cancel the order
  const { body: cancelledOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  //expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  //create a course with course model
  const course = Course.build({
    title: "test",
    price: 20,
  });
  await course.save();
  const user = global.signin();
  //make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ courseId: course.id })
    .expect(201);
  // make a request to cancel the order
  const { body: cancelledOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
