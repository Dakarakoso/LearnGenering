import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from "@learngenering/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
