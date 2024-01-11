import Drivers from "../schemas/DriversSchema";
import {getSubscribeToUrgentUrl, getSubscribeUrl} from "../services/payment";
import Fcm from "../schemas/FcmSchema";
import Subscriptions from "../schemas/SubscribitionsSchema";

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
    static  changeStatus = async (req, res, next) => {
        try {
            const {user_id} = req;
            const currentDate = new Date();
            const futureDate = new Date(currentDate);
            futureDate.setMonth(currentDate.getMonth() + 1);
            await Drivers.updateOne({
                _id: user_id
            }, {
                subscription_status: true,
                subscription_until: futureDate
            });
            res.status(200).json({
                message: 'success'
            })
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
            const currentDate = new Date();
            const futureDate = new Date(currentDate);
            futureDate.setMonth(currentDate.getMonth() + 1);
            await Drivers.updateOne({
                _id: user_id
            }, {
                subToUrgent: true,
                subToUrgentDate: futureDate
            });
            await Fcm.updateOne({
                user_id: user_id,
                is_driver: true
            }, {
                urgent: true
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default SubscriptionsController;
