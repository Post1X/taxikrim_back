import Drivers from "../schemas/DriversSchema";
import {getSubscribeToUrgentUrl, getSubscribeUrl} from "../services/payment";
import Fcm from "../schemas/FcmSchema";
import Subscriptions from "../schemas/SubscribitionsSchema";
import Transactions from "../schemas/TransactionsSchema";

class SubscriptionsController {
    static CreateSubscription = async (req, res, next) => {
        try {
            const {driver, urgent} = req.body;
            const newSubscription = new Subscriptions({
                driver_price: driver,
                urgent_price: urgent
            });
            await newSubscription.save();
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
            const pricelists = await Subscriptions.findOne();
            res.status(200).json(pricelists);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static Subscribe = async (req, res, next) => {
        try {
            const request = await getSubscribeUrl();
            res.status(200).json(request);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static changeStatus = async (req, res, next) => {
        try {
            const {user_id} = req;
            let driver = await Drivers.findById(user_id);
            let futureDate;

            if (driver.subscription_until) {
                futureDate = new Date(driver.subscription_until);
                futureDate.setMonth(futureDate.getMonth() + 1);
            } else {
                const currentDate = new Date();
                futureDate = new Date(currentDate);
                futureDate.setMonth(currentDate.getMonth() + 1);
            }

            await Drivers.updateOne({
                _id: user_id
            }, {
                subscription_status: true,
                subscription_until: futureDate
            });

            const subInfo = await Subscriptions.findOne();
            const newTransaction = new Transactions({
                type: 'regular',
                driverId: user_id,
                date: new Date(),
                price: subInfo.driver_price
            });

            await newTransaction.save();
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static subscribeToUrgent = async (req, res, next) => {
        try {
            const request = await getSubscribeToUrgentUrl();
            res.status(200).json(request);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static urgentVerified = async (req, res, next) => {
        try {
            const {user_id} = req;
            let driver = await Drivers.findById(user_id);
            let futureDate;

            if (driver.subToUrgentDate) {
                futureDate = new Date(driver.subToUrgentDate);
                futureDate.setMonth(futureDate.getMonth() + 1);
            } else {
                const currentDate = new Date();
                futureDate = new Date(currentDate);
                futureDate.setMonth(currentDate.getMonth() + 1);
            }

            await Drivers.updateOne({
                _id: user_id
            }, {
                subToUrgent: true,
                subToUrgentDate: futureDate,
                notification: true,
                popup: true,
                sound_signal: true
            });

            await Fcm.updateOne({
                user_id: user_id,
                is_driver: true,
            }, {
                urgent: true,
                notification: true
            });

            const subInfo = await Subscriptions.findOne();
            const newTransaction = new Transactions({
                type: 'urgent',
                driverId: user_id,
                date: new Date(),
                price: subInfo.urgent_price
            });

            await newTransaction.save();
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default SubscriptionsController;
