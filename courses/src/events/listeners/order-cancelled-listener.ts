import { Listener, OrderCancelledEvent, Subjects } from "@learngenering/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Course } from "../../models/course";
import { CourseUpdatedPublisher } from "../publishers/course-updated";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const course = await Course.findById(data.course.id);

    if (!course) {
      throw new Error("Course not found");
    }

    course.set({ orderId: undefined });
    await course.save();
    await new CourseUpdatedPublisher(this.client).publish({
      id: course.id,
      orderId: course.orderId,
      userId: course.userId,
      price: course.price,
      title: course.title,
      version: course.version,
    });

    msg.ack();
  }
}
