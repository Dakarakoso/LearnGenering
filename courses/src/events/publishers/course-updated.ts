import { Subjects, Publisher, CourseUpdatedEvent } from "@learngenering/common";

export class CourseUpdatedPublisher extends Publisher<CourseUpdatedEvent> {
  readonly subject = Subjects.CourseUpdated;
}
