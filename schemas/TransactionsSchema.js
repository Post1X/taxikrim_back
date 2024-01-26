import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Drivers'
    },
    date: {
        type: Schema.Types.Date
    },
    price: {
        type: Schema.Types.Number
    },
    type: {
        type: Schema.Types.String
    }
})

const Transactions = mongoose.model('Transactions', TransactionsSchema);

export default Transactions;
