import makeCall from "../utilities/call";
import Drivers from "../schemas/DriversSchema";
import Clients from "../schemas/ClientsSchema";
import jwt from "jsonwebtoken";

class DriversController {
    static makeCall = async (req, res, next) => {
        try {
            const {phone} = req.body;
            const client = await Drivers.findOne({
                phone: phone
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
            await makeCall(phone, code)
            if (!client) {
                const newClient = new Drivers({
                    phone: phone,
                    code: code,
                });
                await newClient.save();
            }
            if (client) {
                await Drivers.findOneAndUpdate({
                    phone: phone
                }, {
                    code: code
                })
            }
            ;
            res.status(200).json({
                success: true,
                code: code
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static registerDriver = async (req, res, next) => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            const {phone, code} = req.body;
            console.log(phone, code)
            const client = await Drivers.findOne({
                phone
            });
            if (code !== client.code) {
                res.status(301).json({
                    error: 'Неправильный код. Повторите попытку'
                })
            }
            if (code === client.code) {
                await Drivers.findOneAndUpdate({
                    phone: phone
                }, {
                    code: null
                });
                const token = jwt.sign({
                    phone: phone,
                    user_id: client._id
                }, JWT_SECRET);
                res.status(200).json({
                    token: token,
                    user_data: client,
                    isDriver: true
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static uploadImage = async (req, res, next) => {
        try {
            const file = req.files.find(file => file.fieldname === 'file');
            const parts = file.path.split('public');
            const finalFile = `http://95.163.235.158:3000/${parts[1].substring(1)}`;
            const newImage = new Images({
                url: finalFile
            });
            await newImage.save();
            res.status(200).json(
                newImage.url
            )
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static updateDriver = async (req, res, next) => {
        try {
            const {user_id} = req;
            const regComplete = true;
            const {frontPassport,
                backPassport,
                phone,
                firstName,
                lastName,
                middleName,
                firstCarPhoto,
                secondCarPhoto,
                thirdCarPhoto,
                fourthCarPhoto,
                publicNumber,
                carBrandId,
                carColor,
                carModel,
                tariffId} = req.body;
            await Drivers.updateOne({
                _id: user_id
            }, {
                frontPassport,
                backPassport,
                phone,
                firstName,
                lastName,
                middleName,
                firstCarPhoto,
                secondCarPhoto,
                thirdCarPhoto,
                fourthCarPhoto,
                publicNumber,
                carBrandId,
                carColor,
                carModel,
                tariffId,
                regComplete
            })
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default DriversController;