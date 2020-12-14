import { Request, Response } from "express";
import AuthRoute from "./auth";
import UserRoute from "./user";
import TokenRoute from "./token";

import authenticate from "../middlewares/authenticate";

export default (app: any) => {
  app.get("/", (req: Request, res: Response) => {
    res.status(200).send({
      msg:
        "Welcome to the AUTHENTICATION API. Register or Login to test Authentication.",
    });
  });
  app.use("/api/auth", AuthRoute);
  app.use("/api/user", UserRoute);
  app.use("/api/token", authenticate, TokenRoute);
};
