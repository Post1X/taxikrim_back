import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PaymentsSchema = new Schema({
    driver_id: {
        type: Schema.Types.ObjectId
    },
    order_id: {
        type: Schema.Types.String
    },
    amount: {
        type: Schema.Types.Number
    },
    type: {
        type: Schema.Types.String
    },
    isNew: {
        type: Schema.Types.Boolean
    }
})

const Payments = mongoose.model('Payments', PaymentsSchema);

export default Payments;
