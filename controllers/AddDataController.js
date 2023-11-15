import CarTypes from "../schemas/CarTypesSchema";
import TariffPrices from "../schemas/TariffPrices";

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
