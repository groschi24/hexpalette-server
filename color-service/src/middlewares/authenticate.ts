import { Request, Response } from "express";
import axios from "axios";

const authServerHost = process.env.AUTH_SERVER_HOST;

export default async (req: Request, res: Response, next: any) => {
  const token = req.header("Authorization");

  if (token === undefined) {
    return res
      .status(401)
      .json({ message: "Unauthorized Access - No Token Provided!" });
  }

  const url = `http://${authServerHost}/api/token/checktoken`;

  let response: any;
  try {
    response = await axios({
      method: "GET",
      url,
      headers: { Authorization: token },
    });
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  if (response.status === 200) {
    req.currentUser = response.data; // (property) Request<ParamsDictionary, any, any, Query>.body: any
    // req.body;
    next();
  } else {
    return res
      .status(401)
      .json({ message: "Unauthorized Access - No Token Provided!" });
  }
};
