import Drivers from "../schemas/DriversSchema";
import jwt from "jsonwebtoken";
import CarBrands from "../schemas/CarBrandsSchema";
import {getDispetcherById} from "../api/getDispetcherById";
import Fcm from "../schemas/FcmSchema";
import DeletedDrivers from "../schemas/DeletedDriversSchema";
import makeCall from "../utilities/call";

class DriversController {
    static makeCall = async (req, res, next) => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            const {phone, password, prod} = req.body;
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
            if (JSON.parse(prod) === true) {
                await makeCall(phone, code)
            }
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
            if (JSON.parse(prod) === false)
            {
                return res.status(200).json({
                    success: true,
                    code: code
                });
            }else
                return res.status(200).json({
                    success: true
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
            if (phone === "+7111111" && code === "9999") {
                const testDriver = await Drivers.findOne({
                    phone
                });
                const token = jwt.sign({
                    phone: phone,
                    user_id: testDriver._id
                }, JWT_SECRET);
                return res.status(200).json({
                    token: token,
                    user_data: testDriver,
                    isDriver: true,
                    isReg: true
                })
            } else {
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
                    return res.status(200).json({
                        token: token,
                        user_data: client,
                        isDriver: true,
                        isReg: true
                    })
                }
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
                avatar: driver && driver.avatar ? driver.avatar : null,
                code: driver && driver.code ? driver.code : null,
                passportArray: driver && driver.passportArray ? driver.passportArray : null,
                phone: driver && driver.phone ? driver.phone : null,
                firstName: driver && driver.firstName ? driver.firstName : null,
                lastName: driver && driver.lastName ? driver.lastName : null,
                middleName: driver && driver.middleName ? driver.middleName : null,
                carPhotoArray: driver && driver.carPhotoArray ? driver.carPhotoArray : null,
                telegram: driver && driver.telegram ? driver.telegram : null,
                publicNumber: driver && driver.publicNumber ? driver.publicNumber : null,
                carBrandId: driver && driver.carBrandId ? driver.carBrandId : null,
                carColor: driver && driver.carColor ? driver.carColor : null,
                carModel: driver && driver.carModel ? driver.carModel : null,
                subscription_until: driver && driver.subscription_until ? driver.subscription_until : null,
                tariffId: driver && driver.tariffId ? driver.tariffId : null,
                subscription_status: driver && driver.subscription_status ? driver.subscription_status : null,
                regComplete: driver && driver.regComplete ? driver.regComplete : null,
                fcm_token: driver && driver.fcm_token ? driver.fcm_token : null,
                balance: driver && driver.balance ? driver.balance : null,
                subToUrgent: driver && driver.subToUrgent ? driver.subToUrgent : null,
                subToUrgentDate: driver && driver.subToUrgentDate ? driver.subToUrgentDate : null,
                rejectReason: driver && driver.rejectReason ? driver.rejectReason : null,
                is_banned: driver && driver.is_banned ? driver.is_banned : null,
                notification: driver && driver.notification ? driver.notification : null,
                sound_signal: driver && driver.sound_signal ? driver.sound_signal : null,
                popup: driver && driver.popup ? driver.popup : null,
                deleteDate: new Date(),
                lastLoginTime: driver && driver.lastLoginTime ? driver.lastLoginTime : null
            });
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
            const driver = await Drivers.findOne({
                _id: driver_id
            });
            const newSchema = new DeletedDrivers({
                avatar: driver && driver.avatar ? driver.avatar : null,
                code: driver && driver.code ? driver.code : null,
                passportArray: driver && driver.passportArray ? driver.passportArray : null,
                phone: driver && driver.phone ? driver.phone : null,
                firstName: driver && driver.firstName ? driver.firstName : null,
                lastName: driver && driver.lastName ? driver.lastName : null,
                middleName: driver && driver.middleName ? driver.middleName : null,
                carPhotoArray: driver && driver.carPhotoArray ? driver.carPhotoArray : null,
                telegram: driver && driver.telegram ? driver.telegram : null,
                publicNumber: driver && driver.publicNumber ? driver.publicNumber : null,
                carBrandId: driver && driver.carBrandId ? driver.carBrandId : null,
                carColor: driver && driver.carColor ? driver.carColor : null,
                carModel: driver && driver.carModel ? driver.carModel : null,
                subscription_until: driver && driver.subscription_until ? driver.subscription_until : null,
                tariffId: driver && driver.tariffId ? driver.tariffId : null,
                subscription_status: driver && driver.subscription_status ? driver.subscription_status : null,
                regComplete: driver && driver.regComplete ? driver.regComplete : null,
                fcm_token: driver && driver.fcm_token ? driver.fcm_token : null,
                balance: driver && driver.balance ? driver.balance : null,
                subToUrgent: driver && driver.subToUrgent ? driver.subToUrgent : null,
                subToUrgentDate: driver && driver.subToUrgentDate ? driver.subToUrgentDate : null,
                rejectReason: driver && driver.rejectReason ? driver.rejectReason : null,
                is_banned: driver && driver.is_banned ? driver.is_banned : null,
                notification: driver && driver.notification ? driver.notification : null,
                sound_signal: driver && driver.sound_signal ? driver.sound_signal : null,
                popup: driver && driver.popup ? driver.popup : null,
                deleteDate: new Date(),
                lastLoginTime: driver && driver.lastLoginTime ? driver.lastLoginTime : null
            });
            await newSchema.save();
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


