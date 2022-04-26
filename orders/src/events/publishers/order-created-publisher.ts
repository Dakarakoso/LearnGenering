import { Publisher, OrderCreatedEvent, Subjects } from "@learngenering/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
