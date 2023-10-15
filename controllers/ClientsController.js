import Clients from "../schemas/ClientsSchema";
import makeCall from "../utilities/call";
import jwt from 'jsonwebtoken';

class ClientsController {
    static RegisterNumber = async (req, res, next) => {
        try {
            const {phone_number} = req.body;
            const client = await Clients.findOne({
                phone_number: phone_number
            });

            function generateRandomNumberString() {
                let result = '';
                for (let i = 0; i < 4; i++) {
                    const randomNumber = Math.floor(Math.random() * 10);

                    result += randomNumber.toString();
                }
                return result;
            }

            const code = generateRandomNumberString();
            await makeCall(phone_number, code)
            if (!client) {
                const newClient = new Clients({
                    phone_number: phone_number,
                    code: code,
                    number_activated: false
                });
                await newClient.save();
            }
            if (client) {
                await Clients.findOneAndUpdate({
                    phone_number: phone_number
                }, {
                    code: code
                })
            }
            ;
            res.status(200).json({
                success: true
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static RegisterBuyer = async (req, res, next) => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            const {phone_number, code} = req.body;
            const client = await Clients.findOne({
                phone_number
            });
            if (code !== client.code) {
                res.status(301).json({
                    error: 'Неправильный код. Повторите попытку'
                })
            }
            if (code === client.code) {
                await Clients.findOneAndUpdate({
                    phone_number: phone_number
                }, {
                    code: null
                });
                const token = jwt.sign({
                    phone_number: phone_number,
                    user_id: client._id
                }, JWT_SECRET);
                res.status(200).json({
                    token: token,
                    user_data: client
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateData = async (req, res, next) => {
        try {
            const destination = `${req.files[0].destination}${req.files[0].filename}`.split('public')[1];
            const {user_id} = req;
            const {name} = req.body;
            await Clients.findOneAndUpdate({
                _id: user_id
            }, {
                full_name: name,
                img: destination
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteUser = async (req, res, next) => {
        try {
            const {user_id} = req;
            await Clients.findOneAndDelete({
                _id: user_id
            });
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default ClientsController;
