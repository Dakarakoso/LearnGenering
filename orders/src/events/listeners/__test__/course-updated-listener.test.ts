import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { CourseUpdatedEvent } from "@learngenering/common";
import { CourseUpdatedListener } from "../course-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Course } from "../../../models/course";

const setup = async () => {
  // Create a listener
  const listener = new CourseUpdatedListener(natsWrapper.client);

  // Create and save a course
  const course = Course.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await course.save();

  // Create a fake data object
  const data: CourseUpdatedEvent["data"] = {
    id: course.id,
    version: course.version + 1,
    title: "new concert",
    price: 999,
    userId: "ablskdjf",
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, course, listener };
};

it("finds, updates, and saves a course", async () => {
  const { msg, data, course, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedCourse = await Course.findById(course.id);

  expect(updatedCourse!.title).toEqual(data.title);
  expect(updatedCourse!.price).toEqual(data.price);
  expect(updatedCourse!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { msg, data, listener, course } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
