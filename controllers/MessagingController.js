import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";

class MessagingController {
    static sendMessage = async (req, res, next) => {
        try {
            const {title, body} = req.body;
            const users = await Fcm.find();
            let token_array = [];
            users.map((item) => {
                token_array.push(item.token);
            });
            console.log(token_array);
            console.log(title, body);
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                tokens: token_array
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
            const newToken = new Fcm({
                token: token,
                user_id: user_id,
                is_driver: is_driver
            });
            await newToken.save().then(res.status(200).json({
                message: 'success'
            }));
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default MessagingController;
