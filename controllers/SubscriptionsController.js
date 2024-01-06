import Pricelists from "../schemas/PricelistsSchema";
import Payments from "../schemas/PaymentsSchema";
import PaymentMethods from "../schemas/PaymentMethodsSchema";
import Drivers from "../schemas/DriversSchema";
import {getPaymentUrl} from "../services/payment";

class SubscriptionsController {
    static CreateSubscription = async (req, res, next) => {
        try {
            const {type, price, description} = req.body;
            const newPricelists = new Pricelists({
                type: type,
                price: price,
                description: description
            });
            await newPricelists.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getSubInfo = async (req, res, next) => {
        try {
            const {role} = req.query;
            let filter = {};
            filter.type = role;
            const pricelists = await Pricelists.find(filter);
            res.status(200).json(pricelists);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static Subscribe = async (req, res, next) => {
        try {
            const {user_id} = req;
            const user = await Drivers.findOne({
                _id: user_id
            });
            const orderData = {
                Amount: 50000,
                Description: "Покупка подписки на услуги Водителя в приложении веб-сайта ВСЕЗАКАЗЫ",
                Token: "68711168852240a2f34b6a8b19d2cfbd296c7d2a6dff8b23eda6278985959346",
            };
            const userData = {
                phone_number: user.phone_number,
            };
            const item = [
                {
                    Name: "Подписка",
                    Price: 50000,
                    Quantity: 1,
                    Amount: 50000,
                    Tax: 'vat10'
                }
            ]
            const request = await getPaymentUrl(orderData, userData, item);
            res.status(200).json(request);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static  changeStatus = async (req, res, next) => {
        try {
            const {type} = req.query;
            const {user_id} = req;
            const payment = await PaymentMethods.findOne({
                user_id: user_id,
                isNew: true
            });
            const user = await Drivers.findOne({
                _id: user_id
            })
            // if (payment) {
            await Payments.updateMany({
                seller_id: user_id,
                isNew: false
            })
            const newPayment = new Payments({
                seller_id: user_id,
                // payment_method_id: payment.payment_method_id,
                type: type,
                isNew: true
            })
            console.log('anus1')
            const currentDate = new Date();
            const futureDate = new Date(currentDate);
            futureDate.setMonth(currentDate.getMonth() + 1);
            const isoFormat = futureDate.toISOString();
            if (user.regComplete !== 'complete' && user.regComplete !== 'rejected') {
                await Drivers.findOneAndUpdate({
                    _id: user_id
                }, {
                    subscription_status: true,
                    subscription_until: isoFormat,
                    is_active: true,
                    regComplete: 'subscribed'
                });
            }
            if (user.regComplete === 'complete' && user.regComplete === 'rejected') {
                console.log('anus3')
                await Drivers.findOneAndUpdate({
                    _id: user_id
                }, {
                    subscription_status: true,
                    subscription_until: isoFormat,
                    is_active: true,
                });
            }
            console.log('anus1')
            await newPayment.save()
            res.status(200).json({
                message: 'success'
            })
            // }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
}

export default SubscriptionsController;
