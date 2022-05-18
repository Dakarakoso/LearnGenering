import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Course } from "../../../models/course";
import { natsWrapper } from "../../../nats-wrapper";
import { CourseUpdatedListener } from "../course-updated-listener";
import { CourseUpdatedEvent } from "@learngenering/common";

const setup = async () => {
  // create a listener
  const listener = new CourseUpdatedListener(natsWrapper.client);

  // create and save a course
  const course = Course.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "TEST",
    price: 20,
  });
  await course.save();

  // create a fake data obj
  const data: CourseUpdatedEvent["data"] = {
    id: course.id,
    version: course.version + 1,
    title: "TEST 2",
    price: 10000,
    userId: "dkfjnskdjfn",
  };

  //create a fake msg obj
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all
  return { course, data, msg, listener };
};

it("finds, updates and saves a course", async () => {
  const { course, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedCourse = await Course.findById(course.id);

  expect(updatedCourse!.title).toEqual(data.title);
  expect(updatedCourse!.price).toEqual(data.price);
  expect(updatedCourse!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { data, msg, listener } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { data, msg, listener } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
