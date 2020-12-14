import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export default (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = {};
        errors.array().map((err) => (error[err.param] = err.msg));
        return res.status(422).json({ error });
    }

    next();
};
