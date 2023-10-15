import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubscriptionsSchema = new Schema({
    type: {
        type: Schema.Types.ObjectId,
        ref: 'Pricelists'
    },
    user_id: {
        type: Schema.Types.ObjectId,
    }
})

const Subscriptions = mongoose.model('Subscriptions', SubscriptionsSchema);

export default Subscriptions;
