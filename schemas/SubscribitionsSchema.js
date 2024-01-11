import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubscriptionsSchema = new Schema({
    driver_price: {
        type: Schema.Types.Number
    },
    urgent_price: {
        type: Schema.Types.Number
    }
})

const Subscriptions = mongoose.model('Subscriptions', SubscriptionsSchema);

export default Subscriptions;
