import { Request, Response } from "express";
import * as moment from "moment";
import * as crypto from "crypto-promise";

import sendMail from "../utils/sendMail";

import User, { IUser } from "../models/user";
import { createTokenCtx, getRefreshTokenList } from "../middlewares/token";

/**
 * @route POST api/auth/register
 * @desc Register a new User
 * @access Public
 */
const register = (req: Request, res: Response) => {
  User.findOne({ email: req.body.email })
    .then(async (user: IUser) => {
      if (user) {
        return res.status(401).json({
          msg:
            "The email address you have entered is already associated with another account.",
        });
      }

      const buffer = await crypto.randomBytes(48);
      const verificationToken = buffer.toString("hex");

      const newUser = new User(req.body);
      newUser.verificationToken = verificationToken;

      newUser
        .save()
        .then((user: IUser) => {
          const body = createTokenCtx(user);

          console.log(
            `Please confirm your email http://${req.get(
              "host"
            )}/api/auth/confirm/${verificationToken}`
          );

          sendMail(
            "grosch.dennis08@gmail.com", // TODO: Add registered user mail
            "account_activation",
            {
              name: user.firstName,
              link: `https://hexpalette.com/api/auth/confirm/${verificationToken}`,
            }
          );

          res.status(200).json(body);
        })
        .catch((err: Error) => res.status(500).json({ msg: err.message }));
    })
    .catch((err: Error) =>
      res.status(500).json({
        success: false,
        msg: err.message,
      })
    );
};

const resendActivationCode = (req: Request, res: Response) => {
  const email = req.body.email;

  User.findOne({ email })
    .then((user: IUser) => {
      if (!user) {
        return res.status(401).json({
          msg:
            "The email address " +
            req.body.email +
            " is not associated with any account. Double-check your email address and try again.",
        });
      }

      if (user.verified) {
        return res.status(422).json({
          msg: "User already activated",
        });
      } else {
        sendMail(user.email, "account_activation", {
          name: user.firstName,
          link: `https://hexpalette.com/service/activation/${user.verificationToken}`,
        });

        return res.status(200).json({
          msg: "E-Mail Resend",
        });
      }
    })
    .catch((err: Error) => res.status(500).json({ msg: err.message }));
};

/**
 * @route POST api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
const login = (req: Request, res: Response) => {
  User.findOne({ email: req.body.email })
    .then((user: IUser) => {
      if (!user)
        return res.status(401).json({
          msg:
            "The email address " +
            req.body.email +
            " is not associated with any account. Double-check your email address and try again.",
        });

      // validate password
      if (!user.comparePassword(req.body.password))
        return res.status(401).json({ msg: "Invalid email or password" });

      // Login successful, write token, and send back user
      const body = createTokenCtx(user);
      res.status(200).json(body);
      // res.status(200).json({ token: user.generateJWT(), user: user });
    })
    .catch((err: Error) => res.status(500).json({ msg: err.message }));
};

/**
 * @route POST api/auth/confirm/:verificationToken
 * @desc Activate a new User
 * @access Public
 */
const activateUser = (req: Request, res: Response) => {
  const verificationToken = req.params.verificationToken;

  User.findOne({ verificationToken }).then((user: IUser) => {
    if (!user) {
      return res.status(401).json({
        msg: "User not found",
      });
    }

    user.verified = true;

    user
      .save()
      .then((user: IUser) => {
        res.status(200).json({ msg: "User activated" });
      })
      .catch((err: Error) => res.status(500).json({ msg: err.message }));
  });
};

const refreshTokenAuth = (req: Request, res: Response) => {
  const { email, refreshToken } = req.body;
  const refreshTokens = getRefreshTokenList();

  if (refreshToken in refreshTokens && refreshTokens[refreshToken] === email) {
    User.findOne({ email }).then((user: IUser) => {
      if (!user) {
        return res.status(401).json({
          msg: "User not found",
        });
      }

      const body = createTokenCtx(user);
      res.status(200).json(body);
    });
  } else {
    res.status(401).json({
      msg: "Refresh Token not found or wrong user",
    });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const buffer = await crypto.randomBytes(48);
  const resetToken = buffer.toString("hex");

  User.findOne({ email }).then((user: IUser) => {
    if (!user) {
      return res.status(401).json({
        msg: "User not found",
      });
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = moment().add(1, "hour").toDate();

    user
      .save()
      .then((user: IUser) => {
        sendMail(
          "grosch.dennis08@gmail.com", // TODO: Add registered user mail
          "forgot_password",
          {
            name: user.firstName,
            link: `https://hexpalette.com/service/password/${resetToken}`,
          }
        );

        console.log(
          `${
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://"
          }${req.get("host")}/api/auth/resetPassword/${resetToken}\n\n` +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        );
        res.status(200).json({
          msg: `We sent an email to ${email} containing a password reset link. It will expire in one hour.`,
        });
      })
      .catch((err: Error) => res.status(500).json({ msg: err.message }));
  });
};

const resetPassword = (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body;
  const { resetToken } = req.params;

  if (
    !password ||
    !confirmPassword ||
    (password && confirmPassword && password !== confirmPassword)
  ) {
    res.status(422).json({
      msg: "Password not match",
    });
  } else {
    User.findOne({ resetPasswordToken: resetToken }).then((user: IUser) => {
      if (!user) {
        return res.status(401).json({
          msg: "User not found",
        });
      }

      if (new Date(user.resetPasswordExpires) < new Date()) {
        return res.status(401).json({
          msg: "Password reset expired",
        });
      } else {
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        user
          .save()
          .then((user: IUser) => {
            res.status(200).json({
              msg:
                "Your password has been successfully updated. Please login with your new password.",
            });
          })
          .catch((err: Error) => res.status(500).json({ msg: err.message }));
      }
    });
  }
};

const checkResetPassword = (req: Request, res: Response) => {
  const { resetToken } = req.params;

  User.findOne({ resetPasswordToken: resetToken }).then((user: IUser) => {
    if (!user) {
      return res.status(401).json({
        msg: "Token already used.",
      });
    }



    if (new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(401).json({
        msg: "Password reset expired",
      });
    } else {
      res.status(200).json({
        msg:
          "Password can be resetted",
      });
    }
  });
};

// Add Reset Password here

export default {
  register,
  resendActivationCode,
  login,
  activateUser,
  refreshTokenAuth,
  forgotPassword,
  resetPassword,
  checkResetPassword
};
