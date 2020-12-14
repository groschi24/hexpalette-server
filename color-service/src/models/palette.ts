import { Document, Model, model, Schema } from "mongoose";
import { IColor } from "./color";
import { ITag } from "./tag";

import * as mongoosePaginate from "mongoose-aggregate-paginate-v2";

const PaletteSchema = new Schema(
  {
    user_id: {
      type: String,
      required: "The user_id field is required",
    },
    saves: {
      type: Number,
      default: 0,
    },
    random: {
      type: Number,
      default() {
        return Math.random();
      },
      index: "2d",
    },
    gradient_positions: {
      type: [Number],
      required: "The gradient_positions field is required",
    },
    gradient_rotation: {
      type: Number,
      default: 90,
    },
    gradient_type: {
      type: String,
      default: "linear",
    },
    is_gradient: {
      type: Boolean,
      default: false,
    },
    color_names: {
      type: String,
      default: "",
    },
    tag_names: {
      type: String,
      default: "",
    },
    colors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Color",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

PaletteSchema.index({ color_names: "text", tag_names: "text" });
PaletteSchema.plugin(mongoosePaginate);

interface IPaletteSchema extends Document {
  user_id: string;
  saves: number;
  random: number;
  gradient_positions: number[];
  gradient_rotation: number;
  gradient_type: string;
  is_gradient: boolean;
  color_names: string;
  tag_names: string;
  colors: IColor[];
  tags: ITag[];
}

interface IPaletteBase extends IPaletteSchema {}

export interface IPalette extends IPaletteBase {}

export interface IPaletteModel extends Model<IPalette> {
  aggregatePaginate: any;
}

export default model<IPalette, IPaletteModel>("Palette", PaletteSchema);
