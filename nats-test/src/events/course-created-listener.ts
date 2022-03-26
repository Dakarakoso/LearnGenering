import { Listener } from "./base-listener";
import { Message } from "node-nats-streaming";
import { CourseCreatedEvent } from "./course-created-event";
import { Subjects } from "./subjects";

export class CourseCreatedListener extends Listener<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
  queueGroupName = "payments-service";
  onMessage(data: CourseCreatedEvent["data"], msg: Message): void {
    console.log("Event data", data);
    msg.ack();
  }
}
