import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DriverStatusesSchema = new Schema({
    title: {
        type: Schema.Types.String
    }
})

const DriversStatuses = mongoose.model('Drivers', DriverStatusesSchema);

export default DriversStatuses;
