import { Course } from "../course";

it("implements optimistic concurrency control", async () => {
  // Create an instance of course
  const course = Course.build({
    title: "test",
    price: 5,
    userId: "123",
  });

  // Save the course tp the database
  await course.save();
  // fetch the course twice
  const firstInstance = await Course.findById(course.id);
  const secondInstance = await Course.findById(course.id);
  // make 2 separate changes to the course fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  //save the first fetched course
  await firstInstance!.save();
  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const course = Course.build({
    title: "test",
    price: 5,
    userId: "123",
  });

  await course.save();
  expect(course.version).toEqual(0);
  await course.save();
  expect(course.version).toEqual(1);
  await course.save();
  expect(course.version).toEqual(2);
});
