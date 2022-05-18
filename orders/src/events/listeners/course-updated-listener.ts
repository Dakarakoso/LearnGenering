import { Message } from "node-nats-streaming";
import { Subjects, Listener, CourseUpdatedEvent } from "@learngenering/common";
import { Course } from "../../models/course";
import { queueGroupName } from "./queue-group-name";

export class CourseUpdatedListener extends Listener<CourseUpdatedEvent> {
  subject: Subjects.CourseUpdated = Subjects.CourseUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: CourseUpdatedEvent["data"], msg: Message) {
    const course = await Course.findByEvent(data);
    if (!course) {
      throw new Error("Course not found");
    }
    const { title, price } = data;
    course.set({ title, price });
    await course.save();
    msg.ack();
  }
}
