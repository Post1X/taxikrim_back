import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DispatchersSchema = new Schema({});

const Dispatchers = mongoose.model('Dispatchers', DispatchersSchema);

export default Dispatchers;
