import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";

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
            const {is_driver, token} = req.body;
            const tokenToCheck = await Fcm.findOne({
                token: token,
                user_id: user_id
            });
            if (tokenToCheck)
                return res.status(200).json({
                    message: 'success'
                });
            if (!tokenToCheck && !!token) {
                const newToken = new Fcm({
                    token: token,
                    user_id: user_id,
                    is_driver: is_driver
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
