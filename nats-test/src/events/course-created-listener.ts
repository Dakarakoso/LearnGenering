import { Subjects, Listener, CourseCreatedEvent } from "@learngenering/common";
import { Message } from "node-nats-streaming";
export class CourseCreatedListener extends Listener<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
  queueGroupName = "payments-service";
  onMessage(data: CourseCreatedEvent["data"], msg: Message): void {
    console.log("Event data", data);
    msg.ack();
  }
}
