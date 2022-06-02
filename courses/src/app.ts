import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@learngenering/common";
import { createCourseRouter } from "./routes/new";
import { showCourseRouter } from "./routes/show";
import { indexCourseRouter } from "./routes/index";
import { updateCourseRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser);

app.use(createCourseRouter);
app.use(showCourseRouter);
app.use(indexCourseRouter);
app.use(updateCourseRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
