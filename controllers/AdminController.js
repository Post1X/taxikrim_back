import Drivers from "../schemas/DriversSchema";
import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";
import DeletedDrivers from "../schemas/DeletedDriversSchema";

class AdminController {
    static approveDriver = async (req, res, next) => {
        try {
            const {driverId, tariffId} = req.query;
            await Drivers.updateOne({
                _id: driverId
            }, {
                regComplete: 'complete',
                tariffId: tariffId
            })
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static denyDriver = async (req, res, next) => {
        try {
            const {driverId, comment} = req.query;
            await Drivers.updateOne({
                _id: driverId
            }, {
                regComplete: 'rejected',
                rejectReason: comment
            })
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getVerifying = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const drivers = await Drivers.find({regComplete: "verifying"}).skip(skip).limit(limit);
            if (drivers.length > 0)
                return res.status(200).json(drivers);
            else
                return res.status(200).json([]);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }

    //
    static getAllDrivers = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const drivers = await Drivers.find({regComplete: 'complete'}).skip(skip).limit(limit);
            const arr = [...drivers];
            res.status(200).json(arr);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }

    //
    static banDriver = async (req, res, next) => {
        try {
            const {driverId} = req.query;
            const driver = await Drivers.findOne({
                _id: driverId
            })
            await Drivers.updateOne(
                {_id: driverId},
                {$set: {is_banned: !driver.is_banned}}
            );
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static sendMessageToToken = async (req, res, next) => {
        try {
            const users = await Fcm.find();
            let regularTokenSet = new Set();
            users.forEach((item) => {
                if (item.is_driver === true) {
                    if (item.notification === true)
                        regularTokenSet.add(item.token);
                }
            });
            const regularTokens = Array.from(regularTokenSet);
            const {fcm_token} = req.body;
            if (fcm_token) {
                console.log('HAHAHAHAHAHAHAHHA')
                const sendNotification = async () => {
                    try {
                        await admin.messaging().send({
                            notification: {
                                title: "Тест",
                                body: "Тест",
                            },
                            android: {
                                notification: {
                                    sound: 'new_message.mp3',
                                    channelId: "custom_sound_channel",
                                },
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        sound: 'new_message.mp3'
                                    },
                                },
                            },
                            token: fcm_token
                        });
                    } catch (error) {
                        console.error('Ошибка при отправке уведомления:', error);
                    }
                };
                await sendNotification();
                return res.status(200).json({
                    message: 'success'
                })
            } else {
                console.log('flaopwkdopaskdopkawop')
                const sendNotification = async (tokens, message) => {
                    for (const token of tokens) {
                        try {
                            await admin.messaging().send({
                                notification: {
                                    title: message.title,
                                    body: message.body,
                                },
                                android: {
                                    notification: {
                                        sound: 'new_message.mp3',
                                        channelId: "custom_sound_channel",
                                    },
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            sound: 'new_message.mp3'
                                        },
                                    },
                                },
                                token: token
                            });
                        } catch (error) {
                            console.error('Ошибка при отправке уведомления:', error);
                        }
                    }
                };
                await sendNotification(regularTokens, {
                    title: "Тест",
                    body: "Тест",
                });
                res.status(200).json({
                    message: 'success'
                })
            }
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static changeBalance = async (req, res, next) => {
        try {
            const {price, user_id} = req.body;
            await Drivers.updateOne({
                _id: user_id
            }, {
                balance: price
            });
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getDeletedDrivers = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const deletedDrivers = await DeletedDrivers.find({}).skip(skip).limit(limit);
            res.status(200).json(deletedDrivers);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default AdminController;
