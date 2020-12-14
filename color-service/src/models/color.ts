import { Document, Model, model, Schema } from "mongoose";

const ColorSchema = new Schema(
  {
    name: {
      type: String,
      required: "The name is required",
      text: true,
    },
    hex: {
      type: String,
      required: "The hex is required",
    },
    opacity: {
      type: Number,
      default: 100,
    },
    pos: {
      type: Number,
      required: "The pos is required",
    },
  },
  { timestamps: true }
);

interface IColorSchema extends Document {
  name: string;
  hex: string;
  opacity: number;
  pos: number;
}

interface IColorBase extends IColorSchema {}

export interface IColor extends IColorBase {}

export interface IColorModel extends Model<IColor> {
  paginate: any;
}

export default model<IColor, IColorModel>("Color", ColorSchema);
