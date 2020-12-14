import * as express from "express";
import { check } from "express-validator";
import validate from "../middlewares/validate";
import PaletteController from "../controllers/palette";

import authenticate from "../middlewares/authenticate";
import optional_authenticate from "../middlewares/optional_authenticate";

const router = express.Router();

/**
 * Validation Fields:
 * - sort ( optional )
 * - page ( optional )
 * - size ( optional )
 */
router.get(
  "/palettes",
  [
    check("sort")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("sort must have more than 3 characters")
      .optional(),
    check("page", "page has to be a int").isInt().optional(),
    check("size", "page has to be a int").isInt().optional(),
    check("search", "search must have more than 3 characters")
      .isLength({ min: 3, max: 255 })
      .optional(),
    optional_authenticate,
  ],
  validate,
  PaletteController.getPalettes
);
/**
 * Validation Fields:
 * - sort ( optional )
 * - page ( optional )
 * - size ( optional )
 */
router.get(
  "/palettes/saved",
  [
    check("page", "page has to be a int").isInt().optional(),
    check("size", "page has to be a int").isInt().optional(),
    authenticate,
  ],
  validate,
  PaletteController.getSavedPalettes
);
/**
 * Validation Fields:
 * - colors
 * - tags ( optional )
 */
router.post(
  "/palettes",
  [
    check("colors")
      .exists()
      .isLength({ min: 3, max: 255 })
      .withMessage("colors must have more than 3 characters"),
    check("tags")
      .isLength({ min: 3, max: 255 })
      .withMessage("tags must have more than 3 characters")
      .optional(),
    authenticate,
  ],
  validate,
  PaletteController.postPalettes
);

/**
 * Validation Fields:
 * - id
 */
router.get(
  "/palettes/:id",
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
  PaletteController.getPalettesId
);
/**
 * Validation Fields:
 * - id
 */
router.post(
  "/palettes/:id",
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
  PaletteController.postPalettesId
);
/**
 * Validation Fields:
 * - id
 */
router.patch(
  "/palettes/:id",
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
  PaletteController.patchPalettesId
);

/**
 * Validation Fields:
 * - sort ( optional )
 * - page ( optional )
 * - size ( optional )
 */
router.get(
  "/gradients",
  [
    check("sort")
      .isLength({ min: 3, max: 255 })
      .trim()
      .escape()
      .withMessage("sort must have more than 3 characters")
      .optional(),
    check("page", "page has to be a int").isInt().optional(),
    check("size", "page has to be a int").isInt().optional(),
    optional_authenticate,
  ],
  validate,
  PaletteController.getGradients
);
/**
 * Validation Fields:
 * - colors
 * - tags ( optional )
 * - gradientPositions
 * - gradientRotation
 * - gradientType
 */
router.post(
  "/gradients",
  [
    check("colors")
      .exists()
      .isLength({ min: 3, max: 255 })
      .withMessage("colors must have more than 3 characters"),
    check("tags")
      .isLength({ min: 3, max: 255 })
      .withMessage("tags must have more than 3 characters")
      .optional(),
    check("gradientPositions")
      .exists()
      .withMessage("gradientPositions is required"),
    check("gradientRotation")
      .exists()
      .isLength({ min: 1, max: 255 })
      .withMessage("gradientRotation must have more than 1 characters"),
    check("gradientType")
      .exists()
      .isLength({ min: 3, max: 255 })
      .withMessage("gradientType must have more than 3 characters"),
    authenticate,
  ],
  validate,
  PaletteController.postGradients
);

/**
 * Validation Fields:
 * - id
 */
router.get(
  "/gradients/:id",
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
  PaletteController.getPalettesId
);
/**
 * Validation Fields:
 * - id
 */
router.post(
  "/gradients/:id",
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
  PaletteController.postPalettesId
);
/**
 * Validation Fields:
 * - id
 */
router.patch(
  "/gradients/:id",
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
  PaletteController.patchPalettesId
);

export default router;
