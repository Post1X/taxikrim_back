import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PaymentMethodsSchema = new Schema({
    payment_method_id: {
        type: Schema.Types.String
    },
    user_id: {
        type: Schema.Types.ObjectId,
    }
})

const PaymentMethods = mongoose.model('PaymentMethods', PaymentMethodsSchema);

export default PaymentMethods;
