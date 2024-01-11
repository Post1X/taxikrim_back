import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
    destination_start: {
        type: Schema.Types.Mixed
    },
    destination_end: {
        type: Schema.Types.Mixed
    },
    full_address_start: {
        type: Schema.Types.String
    },
    full_address_end: {
        type: Schema.Types.String
    },
    date: {
        type: Schema.Types.String
    },
    time: {
        type: Schema.Types.String
    },
    car_type: {
        type: Schema.Types.String
    },
    baggage_count: {
        type: Schema.Types.Number
    },
    body_count: {
        type: Schema.Types.Number
    },
    animals: {
        type: Schema.Types.Boolean
    },
    booster: {
        type: Schema.Types.Boolean
    },
    kid: {
        type: Schema.Types.Boolean
    },
    comment: {
        type: Schema.Types.String
    },
    total_price: {
        type: Schema.Types.Number
    },
    commission: {
        type: Schema.Types.Number
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Drivers',
        default: null
    },
    paymentMethod: {
        type: Schema.Types.String
    },
    dispatcher: {
        type: Schema.Types.Number,
    },
    order_status: {
        type: Schema.Types.String,
    },
    id: {
        type: Schema.Types.Number
    }
})


const Orders = mongoose.model('Orders', OrdersSchema);

export default Orders;
