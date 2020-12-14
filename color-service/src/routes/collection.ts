import * as express from "express";
import { check } from "express-validator";
import validate from "../middlewares/validate";
import CollectionController from "../controllers/collection";

import optional_authenticate from "../middlewares/optional_authenticate";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

/**
 * Validation Fields:
 * - page ( optional )
 * - size ( optional )
 */
router.get(
  "/collections",
  [
    check("page", "page has to be a int").isInt().optional(),
    check("size", "page has to be a int").isInt().optional(),
    check("userId", "id must have more than 3 characters")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .optional(),
    optional_authenticate,
  ],
  validate,
  CollectionController.getCollections
);

/**
 * Validation Fields:
 * - name
 * - isPublic ( optional )
 * - paletteIds ( optional )
 */
router.post(
  "/collections",
  [
    check("name")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("name must have more than 3 characters"),
    check("isPublic")
      .isBoolean()
      .withMessage("isPublic must be a boolean")
      .optional(),
    check("paletteIds")
      .isLength({ min: 3, max: 255 })
      .withMessage("paletteIds must have more than 3 characters")
      .optional(),
    authenticate,
  ],
  validate,
  CollectionController.postCollections
);

/**
 * Validation Fields:
 * - id
 */
router.get(
  "/collections/:id",
  [
    check("id")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("id must have more than 3 characters"),
    optional_authenticate,
  ],
  validate,
  CollectionController.getCollectionsId
);

/**
 * Validation Fields:
 * - id
 * - name ( optional )
 * - isPublic ( optional )
 * - paletteIds ( optional )
 * - remove ( optional )
 */
router.patch(
  "/collections/:id",
  [
    check("id")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("id must have more than 3 characters"),
    check("name")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("name must have more than 3 characters")
      .optional(),
    check("isPublic")
      .isBoolean()
      .withMessage("isPublic must be a boolean")
      .optional(),
    check("paletteIds")
      .isLength({ min: 3, max: 255 })
      .withMessage("paletteIds must have more than 3 characters")
      .optional(),
    check("remove")
      .isBoolean()
      .withMessage("isPublic must be a boolean")
      .optional(),
    authenticate,
  ],
  validate,
  CollectionController.patchCollectionsId
);

/**
 * Validation Fields:
 * - id
 */
router.delete(
  "/collections/:id",
  [
    check("id")
      .exists()
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("id must have more than 3 characters"),
    authenticate,
  ],
  validate,
  CollectionController.deleteCollectionsId
);

export default router;
