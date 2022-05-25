import { Message } from "node-nats-streaming";
import { Subjects, Listener, CourseCreatedEvent } from "@learngenering/common";
import { Course } from "../../models/course";
import { queueGroupName } from "./queue-group-name";

export class CourseCreatedListener extends Listener<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const course = Course.build({
      id,
      title,
      price,
    });
    await course.save();

    msg.ack();
  }
}
