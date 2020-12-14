import * as _ from 'lodash';
import * as randtoken from 'rand-token';
import { IUser } from '../models/user';

export let refreshTokens = {};

export const standardizeUser = (user: IUser) => ({
    id: _.get(user, 'id') || '',
    email: _.get(user, 'email') || '',
    username: _.get(user, 'username') || '',
});

// TODO: Delete refresh token after new creation and check how to save ( Mongo Table or Redis Cache server )
export const generateRefreshToken = (email: string) => {
    const refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = email;
    return refreshToken;
};

export const createTokenCtx = (user: IUser) => {
    const jwtToken = user.generateJWT();

    return {
        token: jwtToken.token,
        refreshToken: generateRefreshToken(user.email),
        tokenExpiration: jwtToken.expiration,
        user: standardizeUser(user),
    };
};

export const getRefreshTokenList = () => {
    return refreshTokens;
};

export default {
    standardizeUser,
    generateRefreshToken,
    createTokenCtx,
    getRefreshTokenList,
};
