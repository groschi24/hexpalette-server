import { Request, Response } from "express";
import * as mongoose from "mongoose";

import * as ColorNamer from "color-namer";

import { ResponseJSON, PaginateLabels } from "../utils/types";
import { validateColors, validateId, validateTags } from "../utils/validation";

import Palette, { IPalette } from "../models/palette";
import Color, { IColor } from "../models/color";
import SavedUserPalettes, {
  ISavedUserPalettes,
} from "../models/saved_user_palettes";
import Tag, { ITag } from "../models/tag";

// ROUTE: /palettes
const getPalettes = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  let page = 1;
  let limit = 10;

  let sortField: any = { createdAt: -1 };
  let matchField: any = { is_gradient: { $eq: false } };

  if (req.query && req.query.sort) {
    switch ((req.query as any).sort) {
      case "new":
        sortField = { createdAt: -1 };
        break;
      case "popular":
        sortField = { saves: -1 };
        break;
      case "random":
        sortField = { random: -1 };
        break;
      default:
        sortField = { createdAt: -1 };
    }
  }

  if (req.query && req.query.page) {
    page = Number((req.query as any).page);
  }

  if (req.query && req.query.size) {
    limit = Number((req.query as any).size);
  }

  if (req.query && req.query.search) {
    matchField = Object.assign(matchField, {
      $text: { $search: (req.query as any).search },
    });
  }

  let userId: string = "";
  if (req.currentUser) {
    userId = req.currentUser._id;
  }

  try {
    const skip = limit * (page - 1);

    const aggreagationPipeline = [
      {
        $match: matchField,
      },
      { $sort: sortField },
      { $limit: skip + limit },
      { $skip: skip },
      {
        $lookup: {
          from: "colors",
          localField: "colors",
          foreignField: "_id",
          as: "colors",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
        },
      },
      {
        $lookup: {
          from: "saveduserpalettes",
          localField: "_id",
          foreignField: "palette",
          as: "user_saves",
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          saves: 1,
          random: 1,
          gradient_positions: 1,
          gradient_rotation: 1,
          gradient_type: 1,
          is_gradient: 1,
          colors: 1,
          tags: 1,
          createdAt: 1,
          user_saves: {
            $filter: {
              input: "$user_saves",
              as: "user_save",
              cond: {
                $eq: ["$$user_save.user_id", userId],
              },
            },
          },
        },
      },
    ];

    const nextAggreagationPipeline = [
      {
        $match: matchField,
      },
      { $limit: limit * page + limit },
      { $skip: limit * page },
    ];

    const paletteAggregate = await Palette.aggregate(aggreagationPipeline);

    const nextPageAggregate = await Palette.aggregate(nextAggreagationPipeline);

    if (paletteAggregate) {
      status = 200;
      json.data = {
        items: paletteAggregate,
        limit,
        page,
        hasNextPage: nextPageAggregate.length > 0,
        nextPage: page + 1,
      };
      json.error = false;
      json.message = "success";
    }
  } catch (err) {
    json.message = err;
  }

  res.status(status).json(json);
};

const getSavedPalettes = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const page = 1;
  const limit = 10;

  let userId: string = "";
  if (req.currentUser) {
    userId = req.currentUser._id;
  }

  try {
    const skip = limit * (page - 1);

    const aggreagationPipeline = [
      {
        $match: {
          user_id: { $eq: userId },
        },
      },
      { $limit: skip + limit },
      { $skip: skip },
      {
        $lookup: {
          from: "palettes",
          localField: "palette",
          foreignField: "_id",
          as: "palette",
        },
      },
      {
        $unwind: "$palette",
      },
      {
        $lookup: {
          from: "colors",
          localField: "palette.colors",
          foreignField: "_id",
          as: "palette.colors",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "palette.tags",
          foreignField: "_id",
          as: "palette.tags",
        },
      },
    ];
    const nextAggreagationPipeline = [
      {
        $match: {
          user_id: { $eq: userId },
        },
      },
      { $limit: limit * page + limit },
      { $skip: limit * page },
    ];

    const savedAggregate = await SavedUserPalettes.aggregate(
      aggreagationPipeline
    );

    const nextPageAggregate = await SavedUserPalettes.aggregate(
      nextAggreagationPipeline
    );

    if (savedAggregate) {
      status = 200;
      json.data = {
        items: savedAggregate,
        limit,
        page,
        hasNextPage: nextPageAggregate.length > 0,
        nextPage: page + 1,
      };
      json.error = false;
      json.message = "success";
    }
  } catch (err) {
    console.log("BLAAERR: ", err);
    json.message = err;
  }

  res.status(status).json(json);
};

const postPalettes = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const colors: string[] = req.body.colors;
  let tags: string[] = req.body.tags;
  const userId: string = req.currentUser._id;

  const { colorIsValid, colorValidationMessage } = validateColors(colors);

  let valid = true;
  if (!colorIsValid) {
    valid = false;
    status = 422;
    json.message = colorValidationMessage;
  }

  if (tags) {
    tags = [...new Set(tags)];
    const { tagIsValid, tagValidationMessage } = validateTags(tags);

    if (!tagIsValid) {
      valid = false;
      status = 422;
      json.message = tagValidationMessage;
    }
  }

  if (!validateId(userId)) {
    valid = false;
    status = 422;
    json.message = "User id is wrong";
  }

  if (valid) {
    const newColors: IColor[] = [];
    const gradientPositions = [];
    let newColorNames: string = "";
    let newTagNames: string = "";

    let colorCount = 0;
    for (const hex of colors) {
      let _Color = await Color.findOne({ hex });

      if (_Color === null) {
        const colorName = ColorNamer(hex).pantone[0].name;
        newColorNames += `${colorName};`;

        _Color = new Color();
        _Color.name = colorName;
        _Color.hex = hex;
        _Color.pos = colorCount;

        await _Color
          .save()
          .then((result: IColor) => {
            _Color = result;
          })
          .catch((err: Error) => {
            status = 500;
            json.message = err.message;
          });
      } else {
        newColorNames += `${_Color.name};`;
      }

      newColors.push(_Color);

      const gradientPercentage = 100 / (colors.length - 1);

      gradientPositions.push(gradientPercentage * colorCount);

      colorCount++;
    }

    const newTags: ITag[] = [];
    if (tags) {
      for (const tag of tags) {
        let _Tag = await Tag.findOne({ name: tag });

        if (_Tag === null) {
          _Tag = new Tag();
          _Tag.name = tag;
          newTagNames += `${tag};`;

          await _Tag
            .save()
            .then((result: ITag) => {
              _Tag = result;
            })
            .catch((err: Error) => {
              status = 500;
              json.message = err.message;
            });
        } else {
          newTagNames += `${_Tag.name};`;
        }

        newTags.push(_Tag);
      }
    }

    const checkedTags = tags ? tags.length === newTags.length : true;
    if (newColors.length === colors.length && checkedTags) {
      const newPalette: IPalette = new Palette();

      newPalette.user_id = userId;
      newPalette.color_names = newColorNames;
      newPalette.tag_names = newTagNames;
      newPalette.colors = newColors;
      if (tags) {
        newPalette.tags = newTags;
      }
      newPalette.saves = 1;
      newPalette.gradient_positions = gradientPositions;

      await newPalette.save().then(async (result: IPalette) => {
        const savedUserPalette: ISavedUserPalettes = new SavedUserPalettes();
        savedUserPalette.user_id = userId;
        savedUserPalette.palette = result;

        let hasErrorOnSave = false;
        await savedUserPalette.save().catch((err: Error) => {
          hasErrorOnSave = true;
          status = 500;
          json.message = err.message;
        });

        if (!hasErrorOnSave) {
          status = 200;
          json.data = result;
          json.message = "success";
          json.error = false;
        }
      });
    }
  }

  res.status(status).json(json);
};

// ROUTE: /palettes/:id
// Get palette by id
const getPalettesId = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const id = req.params.id;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    let userId: string = "";
    if (req.currentUser) {
      userId = req.currentUser._id;
    }

    const filter = { _id: mongoose.Types.ObjectId(id) };
    try {
      const palette = await Palette.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "saveduserpalettes",
            localField: "_id",
            foreignField: "palette",
            as: "user_saves",
          },
        },
        {
          $lookup: {
            from: "colors",
            localField: "colors",
            foreignField: "_id",
            as: "colors",
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "tags",
            foreignField: "_id",
            as: "tags",
          },
        },
        {
          $project: {
            user_saves: {
              $filter: {
                input: "$user_saves",
                as: "user_save",
                cond: {
                  $eq: ["$$user_save.user_id", userId],
                },
              },
            },
            _id: 1,
            user_id: 1,
            saves: 1,
            random: 1,
            gradient_positions: 1,
            gradient_rotation: 1,
            gradient_type: 1,
            is_gradient: 1,
            colors: 1,
            tags: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
        {
          $unwind: {
            path: "$user_saves",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            user_id: { $first: "$user_id" },
            saves: { $first: "$saves" },
            random: { $first: "$random" },
            gradient_positions: { $first: "$gradient_positions" },
            gradient_rotation: { $first: "$gradient_rotation" },
            gradient_type: { $first: "$gradient_type" },
            is_gradient: { $first: "$is_gradient" },
            colors: { $first: "$colors" },
            tags: { $first: "$tags" },
            user_saves: { $first: "$user_saves" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            __v: { $first: "$__v" },
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            saves: 1,
            random: 1,
            gradient_positions: 1,
            gradient_rotation: 1,
            gradient_type: 1,
            is_gradient: 1,
            colors: 1,
            tags: 1,
            user_saves: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
      ]);

      if (palette) {
        status = 200;
        json.data = palette;
        json.error = false;
        json.message = "success";
      }
    } catch (err) {
      json.message = err;
    }
  } else {
    status = 422;
    json.message = "Wrong id format";
  }

  res.status(status).json(json);
};

// Save palette by id
const postPalettesId = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const id = req.params.id;
  const userId: string = req.currentUser._id;

  if (validateId(userId)) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const palette: IPalette = await Palette.findOne({ _id: id });

      if (palette) {
        let savedUserPalette: ISavedUserPalettes = await SavedUserPalettes.findOne(
          {
            user_id: userId,
            palette,
          }
        );

        if (savedUserPalette === null) {
          palette.saves = palette.saves + 1;
          palette.random = Math.random();

          await palette
            .save()
            .then(async (result: IPalette) => {
              if (result !== null) {
                savedUserPalette = new SavedUserPalettes();
                savedUserPalette.user_id = userId;
                savedUserPalette.palette = result;

                let isError = false;
                await savedUserPalette.save().catch((err: Error) => {
                  isError = true;
                  json.message = err.message;
                });

                if (!isError) {
                  status = 200;
                  json.data = result;
                  json.error = false;
                  json.message = "success";
                }
              } else {
                status = 404;
                json.message = "Palette not found";
              }
            })
            .catch((err: Error) => {
              json.message = err.message;
            });
        } else {
          status = 422;
          json.message = "Palette already saved";
        }
      } else {
        status = 404;
        json.message = "Palette not found";
      }
    } else {
      status = 422;
      json.message = "Wrong id format";
    }
  } else {
    status = 422;
    json.message = "User id is wrong";
  }

  res.status(status).json(json);
};

// Remove saved palette by id
const patchPalettesId = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const id = req.params.id;
  const userId: string = req.currentUser._id;

  if (validateId(userId)) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const palette: IPalette = await Palette.findOne({ _id: id });

      if (palette) {
        const removed: ISavedUserPalettes = await SavedUserPalettes.findOneAndDelete(
          {
            user_id: userId,
            palette,
          }
        );

        if (removed !== null) {
          status = 200;
          json.error = false;
          json.data = removed;
          json.message = "success";

          palette.saves = palette.saves - 1;
          palette.random = Math.random();

          await palette.save().catch((err: Error) => {
            status = 500;
            json.message = err.message;
            json.error = true;
            json.data = {};
          });
        } else {
          status = 422;
          json.message = "Palette not saved";
        }
      } else {
        status = 404;
        json.message = "Palette not found";
      }
    } else {
      status = 422;
      json.message = "Wrong id format";
    }
  } else {
    status = 422;
    json.message = "User id is wrong";
  }

  res.status(status).json(json);
};

// ROUTE: /gradients
const getGradients = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  let options = {
    page: 1,
    limit: 10,
    customLabels: PaginateLabels,
  };

  if (req.query && req.query.sort) {
    switch ((req.query as any).sort) {
      case "new":
        options = Object.assign(options, {
          sort: { createdAt: -1 },
        });
        break;
      case "popular":
        options = Object.assign(options, {
          sort: { saves: -1 },
        });
        break;
      case "random":
        options = Object.assign(options, {
          sort: { random: -1 },
        });
        break;
      default:
        options = Object.assign(options, {
          sort: { createdAt: -1 },
        });
    }
  }

  if (req.query && req.query.page) {
    options.page = (req.query as any).page;
  }

  if (req.query && req.query.size) {
    options.limit = (req.query as any).size;
  }

  let userId: string = "";
  if (req.currentUser) {
    userId = req.currentUser._id;
  }

  const paletteAggregate = Palette.aggregate([
    {
      $match: { is_gradient: true },
    },
    {
      $lookup: {
        from: "saveduserpalettes",
        localField: "_id",
        foreignField: "palette",
        as: "user_saves",
      },
    },
    {
      $lookup: {
        from: "colors",
        localField: "colors",
        foreignField: "_id",
        as: "colors",
      },
    },
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    },
    {
      $project: {
        user_saves: {
          $filter: {
            input: "$user_saves",
            as: "user_save",
            cond: {
              $eq: ["$$user_save.user_id", userId],
            },
          },
        },
        _id: 1,
        user_id: 1,
        saves: 1,
        random: 1,
        gradient_positions: 1,
        gradient_rotation: 1,
        gradient_type: 1,
        is_gradient: 1,
        colors: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
      },
    },
    {
      $unwind: {
        path: "$user_saves",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        user_id: { $first: "$user_id" },
        saves: { $first: "$saves" },
        random: { $first: "$random" },
        gradient_positions: { $first: "$gradient_positions" },
        gradient_rotation: { $first: "$gradient_rotation" },
        gradient_type: { $first: "$gradient_type" },
        is_gradient: { $first: "$is_gradient" },
        colors: { $first: "$colors" },
        tags: { $first: "$tags" },
        user_saves: { $first: "$user_saves" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        __v: { $first: "$__v" },
      },
    },
    {
      $project: {
        _id: 1,
        user_id: 1,
        saves: 1,
        random: 1,
        gradient_positions: 1,
        gradient_rotation: 1,
        gradient_type: 1,
        is_gradient: 1,
        colors: 1,
        tags: 1,
        user_saves: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
      },
    },
  ]);

  await Palette.aggregatePaginate(
    paletteAggregate,
    options,
    (err: any, result: any) => {
      if (err) {
        json.message = err.toString();
      } else {
        status = 200;
        json.data = result;
        json.error = false;
        json.message = "success";
      }
    }
  );

  res.status(status).json(json);
};

const postGradients = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const colors: string[] = req.body.colors;
  let tags: string[] = req.body.tags;
  const gradientPositions: number[] = req.body.gradientPositions;
  let gradientRotation: number = req.body.gradientRotation;
  const gradientType: string = req.body.gradientType;

  const userId: string = req.currentUser._id;

  const { colorIsValid, colorValidationMessage } = validateColors(colors);

  let valid = true;
  if (colors) {
    if (!colorIsValid) {
      valid = false;
      status = 422;
      json.message = colorValidationMessage;
    }
  } else {
    valid = false;
    status = 422;
    json.message = "Field colors is required";
  }

  if (tags) {
    tags = [...new Set(tags)];
    const { tagIsValid, tagValidationMessage } = validateTags(tags);

    if (!tagIsValid) {
      valid = false;
      status = 422;
      json.message = tagValidationMessage;
    }
  }

  if (!validateId(userId)) {
    valid = false;
    status = 422;
    json.message = "User id is wrong";
  }

  if (colors) {
    if (gradientPositions) {
      if (gradientPositions.length !== colors.length) {
        valid = false;
        status = 422;
        json.message = "Field gradientPositions has to be same size as colors";
      }

      if (gradientPositions.length < 0 || gradientPositions.length > 50) {
        valid = false;
        status = 422;
        json.message = "Field gradientPositions has to small or to big";
      }

      let gradientPositionError = false;
      let gradientPositionErrorMessage = "";

      for (const gpos of gradientPositions) {
        if (typeof gpos !== "number") {
          gradientPositionError = true;
          gradientPositionErrorMessage =
            "Field gradientPositions has to be array of numbers";
        }
      }

      if (
        !gradientPositions.reduce(
          (n: any, item) => n !== false && item >= n && item
        )
      ) {
        gradientPositionError = true;
        gradientPositionErrorMessage =
          "Field gradientPositions have to be in order";
      }

      if (new Set(gradientPositions).size !== gradientPositions.length) {
        gradientPositionError = true;
        gradientPositionErrorMessage =
          "Field gradientPositions not allowed to have duplicates";
      }

      if (gradientPositionError) {
        valid = false;
        status = 422;
        json.message = gradientPositionErrorMessage;
      }
    } else {
      valid = false;
      status = 422;
      json.message = "Field gradientPositions is required";
    }
  }

  if (gradientRotation) {
    if (typeof gradientRotation === "number") {
      gradientRotation = Number(gradientRotation.toFixed(0));
      if (gradientRotation < 0 || gradientRotation > 360) {
        valid = false;
        status = 422;
        json.message = "Field gradientRotation can only be between 0 and 360";
      }
    } else {
      valid = false;
      status = 422;
      json.message = "Field gradientRotation has to be number";
    }
  } else {
    valid = false;
    status = 422;
    json.message = "Field gradientRotation is required";
  }

  if (gradientType) {
    if (typeof gradientType === "string") {
      switch (gradientType) {
        case "linear":
          break;
        case "radial":
          break;
        default:
          valid = false;
          status = 422;
          json.message = "gradientType have to be linear or radial";
      }
    } else {
      valid = false;
      status = 422;
      json.message = "Field gradientType has to be string";
    }
  } else {
    valid = false;
    status = 422;
    json.message = "Field gradientType is required";
  }

  if (valid) {
    const newColors: IColor[] = [];

    let colorCount = 0;
    for (const hex of colors) {
      let _Color = await Color.findOne({ hex });

      if (_Color === null) {
        _Color = new Color();
        _Color.name = ColorNamer(hex).pantone[0].name;
        _Color.hex = hex;
        _Color.pos = colorCount;

        await _Color
          .save()
          .then((result: IColor) => {
            _Color = result;
          })
          .catch((err: Error) => {
            status = 500;
            json.message = err.message;
          });
      }

      newColors.push(_Color);

      colorCount++;
    }

    const newTags: ITag[] = [];
    if (tags) {
      for (const tag of tags) {
        let _Tag = await Tag.findOne({ name: tag });

        if (_Tag === null) {
          _Tag = new Tag();
          _Tag.name = tag;

          await _Tag
            .save()
            .then((result: ITag) => {
              _Tag = result;
            })
            .catch((err: Error) => {
              status = 500;
              json.message = err.message;
            });
        }

        newTags.push(_Tag);
      }
    }

    const checkedTags = tags ? tags.length === newTags.length : true;
    if (newColors.length === colors.length && checkedTags) {
      const newPalette: IPalette = new Palette();

      newPalette.user_id = userId;
      newPalette.colors = newColors;
      if (tags) {
        newPalette.tags = newTags;
      }
      newPalette.saves = 1;
      newPalette.gradient_positions = gradientPositions;
      newPalette.gradient_rotation = gradientRotation;
      newPalette.gradient_type = gradientType;
      newPalette.is_gradient = true;

      await newPalette.save().then(async (result: IPalette) => {
        const savedUserPalette: ISavedUserPalettes = new SavedUserPalettes();
        savedUserPalette.user_id = userId;
        savedUserPalette.palette = result;

        let hasErrorOnSave = false;
        await savedUserPalette.save().catch((err: Error) => {
          hasErrorOnSave = true;
          status = 500;
          json.message = err.message;
        });

        if (!hasErrorOnSave) {
          status = 200;
          json.data = result;
          json.message = "success";
          json.error = false;
        }
      });
    }
  }

  res.status(status).json(json);
};

export default {
  getPalettes,
  getSavedPalettes,
  postPalettes,
  getPalettesId,
  postPalettesId,
  patchPalettesId,
  getGradients,
  postGradients,
};
