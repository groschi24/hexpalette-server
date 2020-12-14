import { Document, Model, model, Schema } from "mongoose";
import { IPalette } from "./palette";

import * as mongoosePaginate from "mongoose-paginate-v2";

const SavedUserPalettesSchema = new Schema(
  {
    user_id: {
      type: String,
      required: "The user is required",
    },
    palette: {
      type: Schema.Types.ObjectId,
      ref: "Palette",
    },
  },
  { timestamps: true }
);

SavedUserPalettesSchema.plugin(mongoosePaginate);

interface ISavedUserPalettesSchema extends Document {
  user_id: string;
  palette: IPalette;
}

interface ISavedUserPalettesBase extends ISavedUserPalettesSchema {}

export interface ISavedUserPalettes extends ISavedUserPalettesBase {}

export interface ISavedUserPalettesModel extends Model<ISavedUserPalettes> {
  paginate: any;
}

export default model<ISavedUserPalettes, ISavedUserPalettesModel>(
  "SavedUserPalettes",
  SavedUserPalettesSchema
);
