import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
    destination_start: {
        type: Schema.Types.Mixed
    },
    destination_end: {
        type: Schema.Types.Mixed
    },
    date: {
        type: Schema.Types.Mixed
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
    checkups: {
        type: Schema.Types.Mixed
    },
    comment: {
        type: Schema.Types.String
    },
    total_price: {
        type: Schema.Types.Decimal128
    },
    commission: {
        type: Schema.Types.Number
    },
    type: {
        type: Schema.Types.Mixed
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Drivers',
        default: null
    },
    paymentMethod: {
        type: Schema.Types.String
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clients'
    },
    dispatcher: {
        type: Schema.Types.ObjectId,
        ref: 'Dispatchers'
    },
    status: {
        type: Schema.Types.ObjectId,
        ref: 'OrderStatuses'
    }
})


const Orders = mongoose.model('Orders', OrdersSchema);

export default Orders;
