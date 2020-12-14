import { Request, Response } from "express";
import { authenticate } from "passport";
import { IUser } from "../models/user";

export default (req: Request, res: Response, next: any) => {
  authenticate("jwt", (err, user: IUser, info) => {
    if (err) return next(err);

    if (!user)
      return res
        .status(401)
        .json({ msg: "Unauthorized Access - No Token Provided!" });

    if (!user.verified) {
      return res
        .status(401)
        .json({ msg: "Unauthorized Access - User not activated" });
    }

    req.user = user;

    next();
  })(req, res, next);
};
