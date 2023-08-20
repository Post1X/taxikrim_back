import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CarTypesSchema = new Schema({
    title: {
        type: Schema.Types.String
    }
})

const CarTypes = mongoose.model('CarTypes', CarTypesSchema);

export default CarTypes;
