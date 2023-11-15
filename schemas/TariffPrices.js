import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TariffPricesSchema = new Schema({
    type: {
        type: Schema.Types.String
    },
    price: {
        type: Schema.Types.Number
    },
    km: {
        type: Schema.Types.Boolean
    }
})

const TariffPrices = mongoose.model('TariffPrices', TariffPricesSchema);

export default TariffPrices;
