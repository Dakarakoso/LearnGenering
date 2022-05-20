import { OrderCreatedEvent, OrderStatus } from "@learngenering/common";
import mongoose from "mongoose";
import { Course } from "../../../models/course";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const course = Course.build({
    title: "concert",
    price: 99,
    userId: "asdf",
  });

  await course.save();

  // Create the fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "alskdfj",
    expiresAt: "alskdjf",
    course: {
      id: course.id,
      price: course.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { msg, course, listener, data };
};

it("sets the orderId of the course", async () => {
  const { msg, course, listener, data } = await setup();

  await listener.onMessage(data, msg);

  const updatedCourse = await Course.findById(course.id);

  expect(updatedCourse!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, course, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a course updated event", async () => {
  const { listener, course, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const courseUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(courseUpdatedData.orderId);
});
