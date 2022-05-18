import { CourseCreatedListener } from "../course-created-listener";
import { CourseCreatedEvent } from "@learngenering/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { Course } from "../../../models/course";

const setup = async () => {
  //create an instance of the listener
  const listener = new CourseCreatedListener(natsWrapper.client);
  //create a fake data event
  const data: CourseCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "TEST",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a course", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a course was created
  const course = await Course.findById(data.id);

  expect(course).toBeDefined();
  expect(data.title).toEqual(data.title);
  expect(data.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, msg, listener } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertion to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
