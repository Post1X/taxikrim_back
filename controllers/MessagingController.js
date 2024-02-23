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
                tokens: ["cbUHZAbspUegiHkjNgo98i:APA91bEu_IKw4Vsyrvkh6jj0kw4h_l9TuqyzaPSH_AghK_zuvZXjhlpZXs2oGT06mD4RtlHSW00cAClzWwqfpMT27ybCkQZ0fdpBLEuPvhI01bWOy_uj6Zqd8DSkJlPvJwlzB3S3SekQ"]
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
            console.log(token);
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
                    token: token,
                    creationDate: new Date()
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
                    user_tariff: tariff,
                    creationDate: new Date()
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
    //
    static untieFcm = async (req, res, next) => {
        try {
            const {device_id} = req.body;
            const {user_id} = req;
            await Fcm.deleteOne({
                device_id: device_id,
                user_id: user_id
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
    static deleteFcm = async (req, res, next) => {
        try {
            const {token} = req.body;
            await Fcm.deleteOne({
                token: token
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

export default MessagingController;
