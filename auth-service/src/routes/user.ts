import { Router } from "express";
import { check, param } from "express-validator";
import validate from "../middlewares/validate";

import UserController from "../controllers/user";

import authenticate from "../middlewares/authenticate";

const router = Router();

router.get("/me", authenticate, UserController.tokenUser);

/**
 * Validation Fields:
 * - bio ( optional )
 * - location ( optional )
 * - recieveNewsletter ( optional )
 */
router.patch(
  "/me",
  [
    check("username")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("username must have more than 3 character")
      .optional(),
    check("bio")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("bio must have more than 3 characters")
      .optional(),
    check("location")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("location must have more than 3 characters")
      .optional(),
    check("recieveNewsletter")
      .isBoolean()
      .withMessage("recieveNewsletter must be a boolean")
      .optional(),
    authenticate,
  ],
  validate,
  UserController.patchUser
);

/**
 * Validation Fields:
 * - email
 */
router.patch(
  "/email",
  [
    check("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail(),
    authenticate,
  ],
  validate,
  UserController.changeUserEmail
);

/**
 * Validation Fields:
 * - resetMailToken
 */
router.get(
  "/email/reset/:resetMailToken",
  [
    check("resetMailToken")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("resetMailToken must have more than 3 characters"),
  ],
  validate,
  UserController.resetUserEmail
);

router.delete("/me", authenticate, UserController.deleteUser);

export default router;
