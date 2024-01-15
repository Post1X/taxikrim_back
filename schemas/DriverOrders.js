import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DriverOrdersSchema = new Schema({
    order_start: {
        type: Schema.Types.String
    },
    order_end: {
        type: Schema.Types.String
    },
    order_start_full: {
        type: Schema.Types.String
    },
    order_end_full: {
        type: Schema.Types.String
    },
    order_tarif: {
        type: Schema.Types.String
    },
    order_count_peeple: {
        type: Schema.Types.String
    },
    order_count_bags: {
        type: Schema.Types.String
    },
    order_date: {
        type: Schema.Types.String
    },
    order_time: {
        type: Schema.Types.String
    },
    order_comment: {
        type: Schema.Types.String
    },
    order_clien_phone: {
        type: Schema.Types.String
    },
    order_price: {
        type: Schema.Types.String
    },

})
