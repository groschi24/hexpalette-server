import { Request, Response } from 'express';
import User, { IUser } from '../models/user';

/**
 * @route GET api/token.checkToken
 * @desc Check if token is correct
 * @access Public
 */
const checkToken = async (req: Request, res: Response) => {
    const ctxUser: any = { ...req.user };

    User.findOne(
        { _id: ctxUser._doc._id },
        {
            password: 0,
            verificationToken: 0,
            __v: 0,
            resetPasswordExpires: 0,
            resetPasswordToken: 0,
        }
    ).then((user: IUser) => {
        if (!user) {
            return res.status(401).json({
                msg: 'User not found',
            });
        }

        res.status(200).json(user);
    });
};

export default {
    checkToken,
};
