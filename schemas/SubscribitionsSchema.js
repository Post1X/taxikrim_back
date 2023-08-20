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

SubscribitionsSchema.virtual('driver_id', {
    ref: 'Drivers',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
})

SubscribitionsSchema.virtual('dispatcher_id', {
    ref: 'Dispatchers',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
})

const Subscriptions = mongoose.model('Subscriptions', SubscriptionsSchema);

export default Subscriptions;
