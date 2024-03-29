import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FcmSchema = new Schema({
    token: {
        type: Schema.Types.String
    },
    user_id: {
        type: Schema.Types.ObjectId
    },
    is_driver: {
        type: Schema.Types.Boolean
    },
    urgent: {
        type: Schema.Types.Boolean,
        default: false
    },
    device_id: {
        type: Schema.Types.String
    },
    user_tariff: {
        type: Schema.Types.String
    },
    notification: {
        type: Schema.Types.Boolean
    },
    creationDate: {
        type: Schema.Types.Date
    }
})

const Fcm = mongoose.model('Fcm', FcmSchema);

export default Fcm;
