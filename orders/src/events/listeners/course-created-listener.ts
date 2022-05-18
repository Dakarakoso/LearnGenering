import { Message } from "node-nats-streaming";
import { Subjects, Listener, CourseCreatedEvent } from "@learngenering/common";
import { queueGroupName } from "./queue-group-name";
import { Course } from "../../models/course";

export class CourseCreatedListener extends Listener<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: CourseCreatedEvent["data"], msg: Message) {
    const { title, price, id } = data;
    const course = Course.build({
      id,
      title,
      price,
    });
    await course.save();

    msg.ack();
  }
}
