import { Document, Model, model, Schema } from "mongoose";
import { IPalette } from "./palette";

const CollectionSchema = new Schema(
  {
    user_id: {
      type: String,
      required: "The user id is required",
    },
    name: {
      type: String,
      required: "The name is required",
    },
    public: {
      type: Boolean,
      default: false,
    },
    palettes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Palette",
      },
    ],
  },
  { timestamps: true }
);

interface ICollectionSchema extends Document {
  user_id: string;
  name: string;
  public: boolean;
  palettes: IPalette[];
}

interface ICollectionBase extends ICollectionSchema {}

export interface ICollection extends ICollectionBase {}

export interface ICollectionModel extends Model<ICollection> {}

export default model<ICollection, ICollectionModel>(
  "Collection",
  CollectionSchema
);
