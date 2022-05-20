import { OrderCancelledEvent } from "@learngenering/common";
import mongoose from "mongoose";
import { Course } from "../../../models/course";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const course = Course.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });
  course.set({ orderId });
  await course.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    course: {
      id: course.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, course, orderId, listener };
};

it("updates the course, publishes an event, and acks the message", async () => {
  const { msg, data, course, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Course.findById(course.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
