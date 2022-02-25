import express from "express";
const router = express.Router();

router.post("/api/users/signin", (req, res) => {
  res.send("Hello! I am a coder");
});

export { router as signinRouter };
