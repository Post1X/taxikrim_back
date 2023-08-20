import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DriversSchema = new Schema({
    avatar_img: {
        type: Schema.Types.String
    },
    passport_array: {
        type: Schema.Types.Array
    },
    first_name: {
        type: Schema.Types.String
    },
    last_name: {
        type: Schema.Types.String
    },
    phone_number: {
        type: Schema.Types.String
    },
    car_array: {
        type: Schema.Types.Array
    },
    state_number: {
        type: Schema.Types.String
    },
    brand: {
        type: Schema.Types.String
    },
    car_color: {
        type: Schema.Types.String
    },
    car_class: {
        type: Schema.Types.String
    },
    status: {
        type: Schema.Types.ObjectId,
        ref: 'DriverStatuses'
    }
})

const Drivers = mongoose.model('Drivers', DriversSchema)
