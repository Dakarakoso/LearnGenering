import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { Password } from "../services/password";
import { User } from "../models/user";
import { validateRequest, BadRequestError } from "@learngenering/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must provide a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (!existUser) {
      throw new BadRequestError("Password or email are incorrect");
    }

    const passwordsMatch = await Password.compare(existUser.password, password);
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    const userJwt = jwt.sign(
      {
        id: existUser.id,
        email: existUser.email,
      },
      process.env.JWT_KEY!
    );

    // store in on session obj
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existUser);
  }
);

export { router as signinRouter };
