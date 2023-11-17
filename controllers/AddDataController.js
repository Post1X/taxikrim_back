import TariffPrices from "../schemas/TariffPrices";
import CarTypes from "../schemas/CarTypesSchema";

class AddDataController {
    static addTariff = async (req, res, next) => {
        try {
            const {title, price, km} = req.query;
            const newTariff = new TariffPrices({
                type: title,
                price: price,
                km: !!km
            })
            await newTariff.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static addCarModel = async (req, res, next) => {
        try {
            const {type} = req.query;
            const newCarType = new CarTypes({
                title: type
            });
            await newCarType.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getCarModel = async (req, res, next) => {
        try {
            const {query} = req.query;
            const newRegex = new RegExp(query, 'i');
            const car_model = await CarTypes.find({
                type: newRegex
            }).populate('type');
            res.status(200).json(car_model);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getTariff = async (req, res, next) => {
        try {
            const {query} = req.query;
            const newRegex = new RegExp(query, 'i');
            const tariff = await TariffPrices.find({
                type: newRegex
            }).populate('type');
            res.status(200).json(tariff);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default AddDataController;
