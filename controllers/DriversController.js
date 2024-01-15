import Drivers from "../schemas/DriversSchema";
import jwt from "jsonwebtoken";
import CarBrands from "../schemas/CarBrandsSchema";

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
            // await makeCall(phone, code)
            if (!client) {
                const newClient = new Drivers({
                    phone: phone,
                    code: code,
                    regComplete: 'in_progress'
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
                    code: null,
                });
                const token = jwt.sign({
                    phone: phone,
                    user_id: client._id
                }, JWT_SECRET);
                res.status(200).json({
                    token: token,
                    user_data: client,
                    isDriver: true,
                    isReg: true
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
            const uploadedFiles = {};
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const parts = file.path.split('public');
                    uploadedFiles[file.fieldname] = `http://95.163.235.158:3000/${parts[1].substring(1)}`;
                });
            }
            res.status(200).json(uploadedFiles);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static updateDriver = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {
                avatar,
                passportArray,
                phone,
                firstName,
                lastName,
                telegram,
                middleName,
                carPhotoArray,
                publicNumber,
                carBrandId,
                carColor,
                carModel,
                tariffId
            } = req.body;
            await Drivers.updateOne({
                _id: user_id
            }, {
                avatar,
                telegram,
                passportArray,
                phone,
                firstName,
                lastName,
                middleName,
                carPhotoArray,
                publicNumber,
                carBrandId,
                carColor,
                carModel,
                tariffId,
                regComplete: "verifying"
            })
            res.status(200).json({
                status: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getData = async (req, res, next) => {
        try {
            const {user_id} = req;
            const userdata = await Drivers.findById({
                _id: user_id
            });
            return res.status(200).json(userdata);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static createBrand = async (req, res, next) => {
        try {
            const {title} = req.body;
            const newCarBrand = new CarBrands({
                title: title
            });
            await newCarBrand.save();
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static updateToken = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {fcm_token} = req.body;
            await Drivers.updateOne({
                _id: user_id
            }, {
                fcm_token
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static isDriverLogged = async (req, res, next) => {
        try {
            const {phone} = req.body;
            const driver = await Drivers.findOne({
                phone: phone
            });
            if (driver)
                return res.status(200).json({
                    wasLogged: true
                })
            if (!driver)
                return res.status(200).json({
                    wasLogged: false
                })
            return res.status(200).json({
                message: 'Непредвиденная техническая ошибка.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default DriversController;
