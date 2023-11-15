import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PricelistsSchema = new Schema({
    type: {
        type: Schema.Types.String
    },
    sub_type: {
        type: Schema.Types.String
    },
    price: {
        type: Schema.Types.Number
    },
    description: {
        type: Schema.Types.String
    }
})

const Pricelists = mongoose.model('Pricelists', PricelistsSchema);

export default Pricelists;
