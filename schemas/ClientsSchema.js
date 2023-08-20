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
    }
})

const Clients = mongoose.model('Clients', ClientsSchema);

export default Clients;
