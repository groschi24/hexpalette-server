import { Router, Request, Response } from "express";
import { check, param } from "express-validator";
import validate from "../middlewares/validate";

import AuthController from "../controllers/auth";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    msg:
      "You are in the Auth Endpoint. Register or Login to test Authentication.",
  });
});

/**
 * Validation Fields:
 * - email
 * - password
 * - username
 * - firstName
 * - lastName
 */
router.post(
  "/register",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
    check("password")
      .exists()
      .isLength({ min: 6, max: 255 })
      .trim()
      .escape()
      .withMessage("Password must have more than 5 characters"),
    check("username")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("Username must have more than 3 characters"),
    check("firstName")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("firstName must have more than 3 characters"),
    check("lastName")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("lastName must have more than 3 characters"),
  ],
  validate,
  AuthController.register
);

/**
 * Validation Fields:
 * - email
 */
router.post(
  "/resend",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
  ],
  validate,
  AuthController.resendActivationCode
);

/**
 * Validation Fields:
 * - email
 * - password
 */
router.post(
  "/login",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
    check("password")
      .exists()
      .isLength({ min: 6, max: 255 })
      .trim()
      .escape()
      .withMessage("Password must have more than 5 characters"),
  ],
  validate,
  AuthController.login
);

/**
 * Validation Fields:
 * - email
 * - refreshToken
 */
router.post(
  "/refreshToken",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
    check("refreshToken")
      .exists()
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("refreshToken must have more than 3 characters"),
  ],
  validate,
  AuthController.refreshTokenAuth
);

/**
 * Validation Fields:
 * - verificationToken
 */
router.get(
  "/confirm/:verificationToken",
  [
    check("verificationToken")
      .exists()
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("verificationToken must have more than 3 characters"),
  ],
  validate,
  AuthController.activateUser
);

/**
 * Validation Fields:
 * - email
 */
router.post(
  "/forgotPassword",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
  ],
  validate,
  AuthController.forgotPassword
);

/**
 * Validation Fields:
 * - resetToken
 * - password
 * - confirmPassword
 */
router.post(
  "/resetPassword/:resetToken",
  [
    check("password")
      .exists()
      .isLength({ min: 6, max: 255 })
      .trim()
      .escape()
      .withMessage("Password must have more than 5 characters"),
    check("confirmPassword")
      .exists()
      .isLength({ min: 6, max: 255 })
      .trim()
      .escape()
      .withMessage("confirmPassword must have more than 5 characters"),
    check("resetToken")
      .exists()
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("resetToken must have more than 3 characters"),
  ],
  validate,
  AuthController.resetPassword
);

/**
 * Validation Fields:
 * - resetToken
 */
router.get(
  "/resetPassword/:resetToken",
  [
    check("resetToken")
      .exists()
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("resetToken must have more than 3 characters"),
  ],
  validate,
  AuthController.checkResetPassword
);

export default router;
