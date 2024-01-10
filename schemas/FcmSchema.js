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
    }
})

const Fcm = mongoose.model('Fcm', FcmSchema);

export default Fcm;