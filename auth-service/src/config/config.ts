import { DurationInputArg1, unitOfTime } from 'moment';

const jwtExpirationMoment: {
    amount: DurationInputArg1;
    type: unitOfTime.DurationConstructor;
} = {
    amount: 1,
    type: 'hour',
};

export default {
    jwtExpiration: '1h',
    jwtExpirationMoment,
};
