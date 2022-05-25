import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@learngenering/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
