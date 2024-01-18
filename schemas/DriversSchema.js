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
    telegram: {
        type: Schema.Types.String
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
    },
    fcm_token: {
        type: Schema.Types.String,
        default: null
    },
    balance: {
        type: Schema.Types.Number,
        default: 0
    },
    subToUrgent: {
        type: Schema.Types.Boolean,
        default: false
    },
    subToUrgentDate: {
        type: Schema.Types.Date,
    },
    rejectReason: {
        type: Schema.Types.String
    }
})

const Drivers = mongoose.model('Drivers', DriversSchema)

export default Drivers;
