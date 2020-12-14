import { Request, Response } from "express";
import * as emailValidator from "email-validator";
import sendMail from "../utils/sendMail";
import * as moment from "moment";
import * as crypto from "crypto-promise";
import User, { IUser } from "../models/user";

// @route GET admin/user
// @desc Returns all users
// @access Public
// TODO: Only Admin has access to all user data
const index = async (req: Request, res: Response) => {
  const users = await User.find({});
  res.status(200).json({ users });
};

const tokenUser = async (req: Request, res: Response) => {
  const ctxUser: any = { ...req.user };

  User.findOne(
    { _id: ctxUser._doc._id },
    {
      password: 0,
      verificationToken: 0,
      __v: 0,
      resetPasswordExpires: 0,
      resetPasswordToken: 0,
      oldMail: 0,
      resetMailToken: 0,
    }
  ).then((user: IUser) => {
    if (!user) {
      return res.status(401).json({
        msg: "User not found",
      });
    }

    res.status(200).json(user);
  });
};

const patchUser = async (req: Request, res: Response) => {
  const ctxUser: any = { ...req.user };

  const user = await User.findOne({ _id: ctxUser._doc._id });

  const username = req.body.username;
  const bio = req.body.bio;
  const location = req.body.location;
  const recieveNewsletter = req.body.recieveNewsletter;

  if (user) {
    if (username) {
      if (typeof username !== "string") {
        return res.status(422).json({
          msg: "Field username has to be a string",
        });
      } else {
        if (username.length < 0 || username.length > 255) {
          return res.status(422).json({
            msg: "Field username is to long or to short",
          });
        } else {
          user.username = username;
        }
      }
    }
    if (bio) {
      if (typeof bio !== "string") {
        return res.status(422).json({
          msg: "Field bio has to be a string",
        });
      } else {
        if (bio.length < 0 || bio.length > 255) {
          return res.status(422).json({
            msg: "Field bio is to long or to short",
          });
        } else {
          user.bio = bio;
        }
      }
    }
    if (location) {
      if (typeof location !== "string") {
        return res.status(422).json({
          msg: "Field location has to be a string",
        });
      } else {
        if (location.length < 0 || location.length > 255) {
          return res.status(422).json({
            msg: "Field location is to long or to short",
          });
        } else {
          user.location = location;
        }
      }
    }
    if (recieveNewsletter) {
      if (typeof recieveNewsletter !== "boolean") {
        return res.status(422).json({
          msg: "Field recieveNewsletter has to be a boolean",
        });
      } else {
        user.recieveNewsletter = recieveNewsletter;
      }
    }

    user
      .save()
      .then((result: IUser) => {
        User.findOne(
          { _id: result._id },
          {
            password: 0,
            verificationToken: 0,
            __v: 0,
            resetPasswordExpires: 0,
            resetPasswordToken: 0,
            oldMail: 0,
            resetMailToken: 0,
          }
        ).then((user: IUser) => {
          if (!user) {
            return res.status(401).json({
              msg: "User not found",
            });
          }

          res.status(200).json(user);
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          msg: err.message,
        });
      });
  } else {
    return res.status(401).json({
      msg: "User not found",
    });
  }
};

const changeUserEmail = async (req: Request, res: Response) => {
  const ctxUser: any = { ...req.user };

  const user = await User.findOne({ _id: ctxUser._doc._id });

  const email = req.body.email;

  if (!emailValidator.validate(email)) {
    return res.status(422).json({
      msg: "Field email is not valid",
    });
  }

  if (user) {
    const buffer = await crypto.randomBytes(48);
    const resetMailToken = buffer.toString("hex");

    user.oldMail = user.email;
    user.email = email;
    user.resetMailToken = resetMailToken;
    user.resetMailExpires = moment().add(24, "hours").toDate();

    user
      .save()
      .then((result: IUser) => {
        sendMail(
          "grosch.dennis08@gmail.com", // TODO: Add registered user mail
          "change_email",
          {
            name: user.firstName,
            link: `https://hexpalette.com/service/email/${resetMailToken}`,
          }
        );
        console.log(
          "Your email was changed, when this was not you can reset it within 24h here: " +
            `https://hexpalette.com/service/email/${resetMailToken}`
        );
        User.findOne(
          { _id: result._id },
          {
            password: 0,
            verificationToken: 0,
            __v: 0,
            resetPasswordExpires: 0,
            resetPasswordToken: 0,
            oldMail: 0,
            resetMailToken: 0,
          }
        ).then((user: IUser) => {
          if (!user) {
            return res.status(401).json({
              msg: "User not found",
            });
          }

          sendMail(user.email, "successful_changed_email", {
            name: user.firstName,
          });

          res.status(200).json(user);
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          msg: err.message,
        });
      });
  } else {
    return res.status(404).json({
      msg: "User not found",
    });
  }
};

const resetUserEmail = async (req: Request, res: Response) => {
  const resetMailToken = req.params.resetMailToken;

  const user = await User.findOne({ resetMailToken });

  if (user) {
    if (new Date(user.resetMailExpires) < new Date()) {
      return res.status(401).json({
        msg: "Email reset expired",
      });
    } else {
      user.email = user.oldMail;
      user.resetMailToken = "";
      user.resetMailExpires = moment().add(1, "millisecond").toDate();

      user
        .save()
        .then((result: IUser) => {
          // sendMail(...)
          console.log(
            "Your mail was reset to old mail, please reset your password..."
          );
          User.findOne(
            { _id: result._id },
            {
              password: 0,
              verificationToken: 0,
              __v: 0,
              resetPasswordExpires: 0,
              resetPasswordToken: 0,
              oldMail: 0,
              resetMailToken: 0,
            }
          ).then((user: IUser) => {
            if (!user) {
              return res.status(401).json({
                msg: "User not found",
              });
            }

            res.status(200).json(user);
          });
        })
        .catch((err: Error) => {
          return res.status(500).json({
            msg: err.message,
          });
        });
    }
  } else {
    return res.status(404).json({
      msg: "User not found",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const ctxUser: any = { ...req.user };

  const user = await User.findOne({ _id: ctxUser._doc._id });

  if (user) {
    await User.remove({ _id: user._id })
      .then(() => {
        res.status(200).json({ message: "Successful deleted user" });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          msg: err.message,
        });
      });
  } else {
    return res.status(404).json({
      msg: "User not found",
    });
  }
};

export default {
  index,
  tokenUser,
  patchUser,
  changeUserEmail,
  resetUserEmail,
  deleteUser,
};
