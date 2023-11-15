import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DriversSchema = new Schema({
    avatar: {
        type: Schema.Types.String
    },
    code: {
        type: Schema.Types.String
    },
    passportArray: {
        type: Schema.Types.Array
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
    carPhotoArray: {
        type: Schema.Types.Array
    },
    publicNumber: {
        type: Schema.Types.String
    },
    carBrandId: {
        type: Schema.Types.ObjectId,
        ref: 'CarBrands'
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
    subscription_until: {
        type: Schema.Types.Date
    },
    subscription_status: {
        type: Schema.Types.Boolean,
        default: false
    },
    regComplete: {
        type: Schema.Types.String,
        default: false
    }
})

const Drivers = mongoose.model('Drivers', DriversSchema)

export default Drivers;
