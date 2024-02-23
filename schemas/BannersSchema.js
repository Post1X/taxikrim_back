import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BannersSchema = new Schema({
    title: {
        type: Schema.Types.String
    },
    img: {
        type: Schema.Types.String
    },
    description: {
        type: Schema.Types.String
    },
    isActive: {
        type: Schema.Types.Boolean
    }
})

const Banners = mongoose.model('Banners', BannersSchema);

export default Banners;
