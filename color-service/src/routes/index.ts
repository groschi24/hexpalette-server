import { Request, Response } from "express";

import PaletteRoute from "./palette";
import CollectionRoute from "./collection";

export default (app: any) => {
  app.use("/api", PaletteRoute);
  app.use("/api", CollectionRoute);
};
