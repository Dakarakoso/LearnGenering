import { Publisher } from "./base-publisher";
import { CourseCreatedEvent } from "./course-created-event";
import { Subjects } from "./subjects";

export class CourseCreatedPublisher extends Publisher<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
}
