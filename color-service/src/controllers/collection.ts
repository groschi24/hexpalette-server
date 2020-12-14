import { Request, Response } from "express";
import * as mongoose from "mongoose";

import { ResponseJSON, PaginateLabels } from "../utils/types";
import { validateId } from "../utils/validation";

import Collection, { ICollection } from "../models/collection";
import Palette from "../models/palette";

const getCollections = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  let page = 1;
  let limit = 10;
  let userId = "";

  if (req.query && req.query.page) {
    page = Number((req.query as any).page);
  }

  if (req.query && req.query.size) {
    limit = Number((req.query as any).size);
  }

  if (req.query && req.query.userId) {
    userId = (req.query as any).userId;
  }

  let loggedUserId: string = "";
  if (req.currentUser) {
    loggedUserId = req.currentUser._id;
  }

  try {
    const skip = limit * (page - 1);

    if (userId !== "") {
      if (userId === loggedUserId) {
        const collectionAggregate = await Collection.aggregate([
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
              localField: "palettes",
              foreignField: "_id",
              as: "palettes",
            },
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              name: 1,
              public: 1,
              palettes: 1,
            },
          },
        ]);

        const nextPageAggregate = await Collection.aggregate([
          {
            $match: {
              user_id: { $eq: userId },
            },
          },
          { $limit: limit * page + limit },
          { $skip: limit * page },
        ]);

        if (collectionAggregate) {
          status = 200;
          json.data = {
            items: collectionAggregate,
            limit,
            page,
            hasNextPage: nextPageAggregate.length > 0,
            nextPage: page + 1,
          };
          json.error = false;
          json.message = "success";
        }
      } else {
        const collectionAggregate = await Collection.aggregate([
          {
            $match: {
              public: { $eq: true },
              user_id: { $eq: userId },
            },
          },
          { $limit: skip + limit },
          { $skip: skip },
          {
            $lookup: {
              from: "palettes",
              localField: "palettes",
              foreignField: "_id",
              as: "palettes",
            },
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              name: 1,
              public: 1,
              palettes: 1,
            },
          },
        ]);

        const nextPageAggregate = await Collection.aggregate([
          {
            $match: {
              public: { $eq: true },
              user_id: { $eq: userId },
            },
          },
          { $limit: limit * page + limit },
          { $skip: limit * page },
        ]);

        if (collectionAggregate) {
          status = 200;
          json.data = {
            items: collectionAggregate,
            limit,
            page,
            hasNextPage: nextPageAggregate.length > 0,
            nextPage: page + 1,
          };
          json.error = false;
          json.message = "success";
        }
      }
    } else {
      const collectionAggregate = await Collection.aggregate([
        {
          $match: {
            public: { $eq: true },
          },
        },
        { $limit: skip + limit },
        { $skip: skip },
        {
          $lookup: {
            from: "palettes",
            localField: "palettes",
            foreignField: "_id",
            as: "palettes",
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            name: 1,
            public: 1,
            palettes: 1,
          },
        },
      ]);

      const nextPageAggregate = await Collection.aggregate([
        {
          $match: {
            public: { $eq: true },
          },
        },
        { $limit: limit * page + limit },
        { $skip: limit * page },
      ]);

      if (collectionAggregate) {
        status = 200;
        json.data = {
          items: collectionAggregate,
          limit,
          page,
          hasNextPage: nextPageAggregate.length > 0,
          nextPage: page + 1,
        };
        json.error = false;
        json.message = "success";
      }
    }
  } catch (err) {
    json.message = err;
  }

  res.status(status).json(json);
};

const postCollections = async (req: Request, res: Response) => {
  let status: number = 500;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "Oops something went wrong!",
  };

  const name: string = req.body.name;
  let isPublic: boolean = req.body.isPublic;
  let paletteIds: string[] = req.body.paletteIds;
  const userId: string = req.currentUser._id;

  let valid = true;

  if (name) {
    if (typeof name !== "string") {
      valid = false;
      status = 422;
      json.message = "Field name must be string";
    } else {
      if (name.length < 3 || name.length > 50) {
        valid = false;
        status = 422;
        json.message = "Field name is to short or to long";
      }
    }
  } else {
    valid = false;
    status = 422;
    json.message = "Field name is required";
  }

  if (isPublic) {
    if (typeof isPublic !== "boolean") {
      valid = false;
      status = 422;
      json.message = "Field isPublic must be boolean";
    }
  } else {
    isPublic = false;
  }

  if (!validateId(userId)) {
    valid = false;
    status = 422;
    json.message = "User id is wrong";
  }

  if (paletteIds) {
    if (paletteIds.length < 1 || paletteIds.length > 50) {
      valid = false;
      status = 422;
      json.message = "Field paletteIds is wrong size";
    } else {
      let hasError = false;
      let hasErrorMessage = "";

      for (const paletteId of paletteIds) {
        if (!validateId(paletteId)) {
          hasError = true;
          hasErrorMessage = "one id is wrong";
        }

        if (typeof paletteId !== "string") {
          hasError = true;
          hasErrorMessage = "all ids have to be string";
        }
      }

      if (new Set(paletteIds).size !== paletteIds.length) {
        hasError = true;
        hasErrorMessage = "not allowed to have duplicates";
      }

      if (hasError) {
        valid = false;
        status = 422;
        json.message = "Field paletteIds " + hasErrorMessage;
      }
    }
  } else {
    paletteIds = [];
  }

  if (valid) {
    let palettes: any[] = [];

    if (paletteIds) {
      const paletteObjectIds = paletteIds.map((paletteId: string) =>
        mongoose.Types.ObjectId(paletteId)
      );

      palettes = await Palette.find({
        _id: {
          $in: paletteObjectIds,
        },
      });
    }

    if (palettes.length !== paletteIds.length) {
      status = 422;
      json.message = "One of the palettes was not found";
    } else {
      const newCollection = new Collection();
      newCollection.user_id = userId;
      newCollection.name = name;
      newCollection.public = isPublic;

      if (palettes && palettes.length > 0) {
        newCollection.palettes = palettes;
      }

      await newCollection
        .save()
        .then((result: ICollection) => {
          status = 200;
          json.data = result;
          json.message = "success";
          json.error = false;
        })
        .catch((err: Error) => {
          status = 500;
          json.message = err.message;
        });
    }
  }

  res.status(status).json(json);
};

const getCollectionsId = async (req: Request, res: Response) => {
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
      const collection = await Collection.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "palettes",
            localField: "palettes",
            foreignField: "_id",
            as: "palettes",
          },
        },
        {
          $unwind: {
            path: "$palettes",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "colors",
            localField: "palettes.colors",
            foreignField: "_id",
            as: "palettes.colors",
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "palettes.tags",
            foreignField: "_id",
            as: "palettes.tags",
          },
        },
        {
          $group: {
            _id: "$_id",
            user_id: { $first: "$user_id" },
            name: { $first: "$name" },
            public: { $first: "$public" },
            palettes: { $push: "$palettes" },
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            name: 1,
            public: 1,
            palettes: {
              $filter: {
                input: "$palettes",
                as: "p",
                cond: { $ifNull: ["$$p._id", false] },
              },
            },
          },
        },
      ]);

      if (collection) {
        status = 200;
        json.data = collection;
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
const patchCollectionsId = async (req: Request, res: Response) => {
  let status: number = 200;
  const json: ResponseJSON = {
    data: {},
    error: true,
    message: "success",
  };

  const id = req.params.id;
  const name: string = req.body.name;
  let isPublic: boolean = req.body.isPublic;
  const paletteIds: string[] = req.body.paletteIds;
  let remove: boolean = req.body.remove;
  const userId: string = req.currentUser._id;

  let valid = true;
  if (name) {
    if (typeof name !== "string") {
      valid = false;
      status = 422;
      json.message = "Field name must be string";
    } else {
      if (name.length < 3 || name.length > 50) {
        valid = false;
        status = 422;
        json.message = "Field name is to short or to long";
      }
    }
  }

  if (isPublic) {
    if (typeof isPublic !== "boolean") {
      valid = false;
      status = 422;
      json.message = "Field isPublic must be boolean";
    }
  } else {
    isPublic = false;
  }

  if (!validateId(userId)) {
    valid = false;
    status = 422;
    json.message = "User id is wrong";
  }

  if (!validateId(id)) {
    valid = false;
    status = 422;
    json.message = "Collection id is wrong";
  }

  if (remove) {
    if (typeof remove !== "boolean") {
      valid = false;
      status = 422;
      json.message = "Field remove must be boolean";
    }
  } else {
    remove = false;
  }

  if (paletteIds) {
    if (paletteIds.length < 1 || paletteIds.length > 50) {
      valid = false;
      status = 422;
      json.message = "Field paletteIds is wrong size";
    } else {
      let hasError = false;
      let hasErrorMessage = "";

      for (const paletteId of paletteIds) {
        if (!validateId(paletteId)) {
          hasError = true;
          hasErrorMessage = "one id is wrong";
        }

        if (typeof paletteId !== "string") {
          hasError = true;
          hasErrorMessage = "all ids have to be string";
        }
      }

      if (new Set(paletteIds).size !== paletteIds.length) {
        hasError = true;
        hasErrorMessage = "not allowed to have duplicates";
      }

      if (hasError) {
        valid = false;
        status = 422;
        json.message = "Field paletteIds " + hasErrorMessage;
      }
    }
  }

  if (valid) {
    const checkedCollection = await Collection.findById(id);

    if (checkedCollection && checkedCollection !== null) {
      if (checkedCollection.user_id === userId) {
        const setFields: any = {};
        let arrayFields: any = {};

        if (name) {
          setFields.name = name;
        }
        setFields.public = isPublic;

        let palettes: any[] = [];

        if (paletteIds) {
          const paletteObjectIds = paletteIds.map((paletteId: string) =>
            mongoose.Types.ObjectId(paletteId)
          );

          palettes = await Palette.find({
            _id: {
              $in: paletteObjectIds,
            },
          });
        }

        if (palettes && palettes.length > 0) {
          if (remove) {
            arrayFields = {
              $pullAll: { palettes },
            };
          } else {
            arrayFields = {
              $addToSet: { palettes: { $each: palettes } },
            };
          }
        }

        const query: any = {};

        if (Object.keys(setFields).length > 0) {
          query.$set = setFields;
        }

        if (Object.keys(arrayFields).length > 0) {
          query[Object.keys(arrayFields)[0]] =
            arrayFields[Object.keys(arrayFields)[0]];
        }

        try {
          const updatedCollection = await Collection.updateOne(
            { _id: id },
            query,
            { upsert: true }
          );
          if (updatedCollection) {
            status = 200;
            json.data = updatedCollection;
            json.error = false;
            json.message = "success";
          }
        } catch (err) {
          json.message = err;
        }
      } else {
        status = 400;
        json.message = "Not authorized to edit this collection";
      }
    } else {
      status = 404;
      json.message = "Collection not found";
    }
  }

  res.status(status).json(json);
};
const deleteCollectionsId = async (req: Request, res: Response) => {
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
      const removed: ICollection = await Collection.findOneAndDelete({
        _id: id,
        user_id: userId,
      });

      if (removed !== null) {
        status = 200;
        json.error = false;
        json.data = removed;
        json.message = "success";
      } else {
        status = 404;
        json.message = "Collection not found";
      }
    }
  }

  res.status(status).json(json);
};

export default {
  getCollections,
  postCollections,
  getCollectionsId,
  patchCollectionsId,
  deleteCollectionsId,
};
