import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PaymentsSchema = new Schema({
   user_id: {
       type: Schema.Types.ObjectId
   },
    order_id: {
        type: Schema.Types.String
    },
    forSub: {
        type: Schema.Types.Boolean
    },
    forMonth: {
        type: Schema.Types.Boolean
    },
    forYear: {
        type: Schema.Types.Boolean
    },
    isDispatch: {
       type: Schema.Types.Boolean
    }
})

const Payments = mongoose.model('Payments', PaymentsSchema);

export default Payments;
