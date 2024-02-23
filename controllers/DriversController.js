import Drivers from "../schemas/DriversSchema";
import jwt from "jsonwebtoken";
import CarBrands from "../schemas/CarBrandsSchema";
import {getDispetcherById} from "../api/getDispetcherById";
import Fcm from "../schemas/FcmSchema";
import DeletedDrivers from "../schemas/DeletedDriversSchema";

class DriversController {
    static makeCall = async (req, res, next) => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            const {phone, password} = req.body;
            const client = await Drivers.findOne({
                phone: phone
            });
            const admLogin = process.env.ADMIN_NUMBER;
            const admPassword = process.env.ADMIN_PASSWORD;
            if (phone === admLogin && !password)
                return res.status(200).json({
                    message: 'success',
                    isAdmin: true
                })
            if (phone === admLogin && !!password && admPassword === password) {
                const token = jwt.sign({
                    isAdmin: true
                }, JWT_SECRET);
                res.status(200).json({
                    token,
                    isAdmin: true
                })
            }
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
                    regComplete: 'in_progress',
                    notification: false
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
                    lastLoginTime: new Date()
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
                    uploadedFiles[file.fieldname] = `http://5.35.89.71:3001/${parts[1].substring(1)}`;
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
    static updateDriverLogged = async (req, res, next) => {
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
                tariffId,
                sound_signal,
                notification,
                popup
            } = req.body;
            if (notification === true || notification === false) {
                await Fcm.update({
                    user_id: user_id
                }, {
                    notification: notification
                })
            } else
                res.status(400).json({
                    error_message: 'Incorrect property: notification'
                })
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
                sound_signal,
                notification,
                popup
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
            const {user_id, isAdmin} = req;
            let userdata;
            if (user_id)
                userdata = await Drivers.findById({
                    _id: user_id
                });
            let admin;
            if (isAdmin === true)
                admin = true
            if (isAdmin === false)
                admin = false
            let response = {
                ...(userdata !== null && {userdata}),
                isAdmin: admin
            }
            return res.status(200).json(
                response
            );
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
            const {phone} = req.query;
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
    //
    static deleteAccount = async (req, res, next) => {
        try {
            const {user_id} = req;
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const newSchema = new DeletedDrivers({
                avatar: driver.avatar,
                code: driver.code,
                passportArray: driver.passportArray,
                phone: driver.phone,
                firstName: driver.firstName,
                lastName: driver.lastName,
                middleName: driver.middleName,
                carPhotoArray: driver.carPhotoArray,
                telegram: driver.telegram,
                publicNumber: driver.publicNumber,
                carBrandId: driver.carBrandId,
                carColor: driver.carColor,
                carModel: driver.carModel,
                subscription_until: driver.subscription_until,
                tariffId: driver.tariffId,
                subscription_status: driver.subscription_status,
                regComplete: driver.regComplete,
                fcm_token: driver.fcm_token,
                balance: driver.balance,
                subToUrgent: driver.subToUrgent,
                subToUrgentDate: driver.subToUrgentDate,
                rejectReason: driver.rejectReason,
                is_banned: driver.is_banned,
                notification: driver.notification,
                sound_signal: driver.sound_signal,
                popup: driver.popup,
                deleteDate: new Date(),
                lastLoginTime: driver.lastLoginTime ? driver.lastLogintime : null
            })
            await newSchema.save();
            await Drivers.deleteOne({
                _id: user_id
            });
            return res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static deleteDriverAccById = async (req, res, next) => {
        try {
            const {driver_id} = req.body;
            await Drivers.deleteOne({
                _id: driver_id
            });
            return res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getDispatch = async (req, res, next) => {
        try {
            const {dispatch_id} = req.query;
            const response = await getDispetcherById(dispatch_id);
            res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getCars = async (req, res, next) => {
        try {
            const cars = await CarBrands.find();
            res.status(200).json(cars);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default DriversController;


