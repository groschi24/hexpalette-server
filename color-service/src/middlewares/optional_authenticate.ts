import { Request, Response } from "express";
import axios from "axios";

const authServerHost = process.env.AUTH_SERVER_HOST;

export default async (req: Request, res: Response, next: any) => {
  const token = req.header("Authorization");
  let response: any = {};

  if (token !== undefined) {
    const url = `http://${authServerHost}/api/token/checktoken`;
    response = await axios({
      method: "GET",
      url,
      headers: { Authorization: token },
    }).catch((e) => {
      return;
    });

    if (response && response.status === 200) {
      req.currentUser = response.data;
    }
  }

  next();
};
