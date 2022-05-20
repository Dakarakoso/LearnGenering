import { Listener, OrderCreatedEvent, Subjects } from "@learngenering/common";
import { Message } from "node-nats-streaming";
import { Course } from "../../models/course";
import { CourseUpdatedPublisher } from "../publishers/course-updated";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // find the course the the order is reserving
    const course = await Course.findById(data.course.id);
    //if no course, throw error
    if (!course) {
      throw new Error("Course not found!");
    }

    // mark the course as being reserved by setting its orderId property
    course.set({ orderId: data.id });

    // save the course
    await course.save();
    await new CourseUpdatedPublisher(this.client).publish({
      id: course.id,
      price: course.price,
      title: course.title,
      userId: course.userId,
      orderId: course.orderId,
      version: course.version,
    });

    // ack message
    msg.ack();
  }
}
