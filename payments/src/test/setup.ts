import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../nats-wrapper.ts");
process.env.STRIPE_KEY =
  "sk_test_51J10UBJRJClnUqK6gnMvNJyQmZsCY7xZgiUOQOU1Xsc81Iddq5kvIq3lW69DppIbGXfTuvxZ5BNZ0jnRT53kthiZ00qiEz9eDT";

let mongod: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "dkjnksjn";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongod.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  //  create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session Obj. {jwt: MY-JWT}
  const session = { jwt: token };

  //  turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // take Json and encode it as base 64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
