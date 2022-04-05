import { Subjects, Publisher, CourseCreatedEvent } from "@learngenering/common";

export class CourseCreatedPublisher extends Publisher<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
}
