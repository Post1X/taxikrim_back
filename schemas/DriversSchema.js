import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DriversSchema = new Schema({
    avatar: {
        type: Schema.Types.String
    },
    code: {
        type: Schema.Types.String
    },
    frontPassport: {
        type: Schema.Types.String
    },
    backPassport: {
        type: Schema.Types.String
    },
    phone: {
        type: Schema.Types.String
    },
    firstName: {
        type: Schema.Types.String
    },
    lastName: {
        type: Schema.Types.String
    },
    middleName: {
        type: Schema.Types.String
    },
    firstCarPhoto: {
        type: Schema.Types.String
    },
    secondCarPhoto: {
        type: Schema.Types.String
    },
    thirdCarPhoto: {
        type: Schema.Types.String
    },
    fourthCarPhoto: {
        type: Schema.Types.String
    },
    publicNumber: {
        type: Schema.Types.String
    },
    carBrandId: {
        type: Schema.Types.ObjectId,
        ref: 'CarTypes'
    },
    carColor: {
        type: Schema.Types.String
    },
    carModel: {
        type: Schema.Types.String
    },
    tariffId: {
        type: Schema.Types.ObjectId,
        ref: 'TariffPrices'
    },
    isDispatch: {
        type: Schema.Types.Boolean
    },
    subscription_until: {
        type: Schema.Types.Date
    },
    subscription_status: {
        type: Schema.Types.Boolean,
        default: false
    },
    regComplete: {
        type: Schema.Types.Boolean,
        default: false
    }
})

const Drivers = mongoose.model('Drivers', DriversSchema)

export default Drivers;
