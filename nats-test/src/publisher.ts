import nats from "node-nats-streaming";
import { CourseCreatedPublisher } from "./events/course-created-publisher";

console.clear();

const stan = nats.connect("learngenering", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new CourseCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }

  // const data = JSON.stringify({
  //   id: "123",
  //   title: "concert",
  //   price: 20,
  // });

  // stan.publish("course:created", data, () => {
  //   console.log("Event published");
  // });
});
