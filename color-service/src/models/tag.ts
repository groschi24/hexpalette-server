import { Document, Model, model, Schema } from "mongoose";

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: "The name is required",
    },
  },
  { timestamps: true }
);

interface ITagSchema extends Document {
  name: string;
}

interface ITagBase extends ITagSchema {}

export interface ITag extends ITagBase {}

export interface ITagModel extends Model<ITag> {}

export default model<ITag, ITagModel>("Tag", TagSchema);
