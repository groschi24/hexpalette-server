import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { genSalt, compareSync, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import config from "../config/config";
import * as moment from "moment";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Your email is required",
      trim: true,
    },
    oldMail: {
      type: String,
      required: false,
      max: 255,
    },
    resetMailToken: {
      type: String,
      required: false,
      max: 255,
    },
    resetMailExpires: {
      type: Date,
      required: false,
    },
    username: {
      type: String,
      unique: true,
      required: "Your username is required",
    },
    password: {
      type: String,
      required: "Your password is required",
      max: 100,
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
    verificationToken: {
      type: String,
      required: false,
      max: 255,
    },
    resetPasswordToken: {
      type: String,
      required: false,
      max: 255,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    deactivated: {
      type: Boolean,
      required: false,
    },
    firstName: {
      type: String,
      required: "First Name is required",
      max: 100,
    },
    lastName: {
      type: String,
      required: "Last Name is required",
      max: 100,
    },
    bio: {
      type: String,
      required: false,
      max: 255,
    },
    location: {
      type: String,
      required: false,
      max: 255,
    },
    website: {
      type: String,
      required: false,
      max: 255,
    },
    recieveNewsletter: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

interface IUserSchema extends Document {
  email: string;
  oldMail: string;
  resetMailToken: string;
  resetMailExpires: Date;
  username: string;
  password: string;
  verified: boolean;
  verificationToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  deactivated: boolean;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  recieveNewsletter: boolean;
}

// Virtuals
UserSchema.virtual("fullName").get(function () {
  return this.firstName + this.lastName;
});

// Methods
UserSchema.methods.comparePassword = function (password: string) {
  return compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function (): {
  token: string;
  expiration: number;
} {
  const payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
  };

  return {
    token: sign(payload, process.env.JWT_SECRET, {
      expiresIn: config.jwtExpiration,
    }),
    expiration: moment()
      .add(config.jwtExpirationMoment.amount, config.jwtExpirationMoment.type)
      .unix(),
  };
};

interface IUserBase extends IUserSchema {
  fullName: string;
  comparePassword(password: string): boolean;
  generateJWT(): {
    token: string;
    expiration: number;
  };
}

export interface IUser extends IUserBase {
}

// Static methods

// Model Export
export interface IUserModel extends Model<IUser> {
}

// Middlewares
UserSchema.pre<IUser>("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  genSalt(10, (err, salt) => {
    if (err) return next(err);

    hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

// Default export
export default model<IUser, IUserModel>("User", UserSchema);
