import express from "express";
const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  res.send("Hello! I am a coder");
});

export { router as currentUserRouter };
