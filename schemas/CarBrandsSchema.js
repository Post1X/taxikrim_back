import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CarBrandsSchema = new Schema({
    title: {
        type: Schema.Types.String
    }
})

const CarBrands = mongoose.model('CarBrands', CarBrandsSchema);

export default CarBrands;
