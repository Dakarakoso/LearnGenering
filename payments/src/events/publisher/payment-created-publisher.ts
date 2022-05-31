import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from "@learngenering/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
