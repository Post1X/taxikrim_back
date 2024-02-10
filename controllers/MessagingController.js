import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";
import Drivers from "../schemas/DriversSchema";

class MessagingController {
    static sendMessage = async (req, res, next) => {
        try {
            const {title, body} = req.body;
            const users = await Fcm.find();
            let tokenSet = new Set();
            users.forEach((item) => {
                if (item.is_driver === true) {
                    tokenSet.add(item.token);
                }
            });
            let uniqueTokens = Array.from(tokenSet);
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                tokens: uniqueTokens
            };
            admin.messaging()
                .sendMulticast(message)
                .then(() => {
                    res.status(200).json({
                        message: 'ok'
                    });
                })
                .catch((error) => {
                    throw error;
                });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static generateTokenForUser = async (req, res, next) => {
        try {
            const {user_id} = req;
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const tariff = driver.tariffId;
            const notification = driver.notification;
            const {is_driver, token, is_vip, device_id} = req.body;
            const tokenToCheck = await Fcm.findOne({
                user_id: user_id,
                device_id: device_id
            });
            if (token === null || device_id === null)
                return res.status(400).json({
                    error_message: 'Налловый токен'
                })
            if (tokenToCheck) {
                await Fcm.updateOne({
                    user_id: user_id,
                    device_id: device_id,
                    notification: notification,
                    user_tariff: tariff
                }, {
                    urgent: is_vip,
                    token: token
                })
                return res.status(200).json({
                    message: 'success'
                });
            }
            if (!tokenToCheck) {
                const newToken = new Fcm({
                    token: token,
                    user_id: user_id,
                    is_driver: is_driver,
                    urgent: is_vip,
                    device_id: device_id,
                    notification: notification,
                    user_tariff: tariff
                });
                await newToken.save().then(res.status(200).json({
                    message: 'success'
                }));
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default MessagingController;
