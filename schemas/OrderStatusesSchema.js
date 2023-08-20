import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderStatusesSchema = new Schema({
    title: {
        type: Schema.Types.String
    }
})

const OrderStatuses = mongoose.model('OrderStatuses', OrderStatusesSchema);

export default OrderStatuses;
