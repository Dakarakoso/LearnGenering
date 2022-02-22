import express from "express";
import { json } from "body-parser";
const port = "3000";
const app = express();
app.use(json());

app.listen(3000, () => {
  console.log(`Listening on port ${port}, testing set up`);
});
