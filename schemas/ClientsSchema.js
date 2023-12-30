import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ClientsSchema = new Schema({
    phone_number: {
        type: Schema.Types.String
    },
    full_name: {
        type: Schema.Types.String
    },
    img: {
        type: Schema.Types.String
    },
    code: {
        type: Schema.Types.String,
        default: null
    }
})

const Clients = mongoose.model('Clients', ClientsSchema);

export default Clients;
