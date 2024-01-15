import Drivers from "../schemas/DriversSchema";
import {getPaymentUrl} from "../services/payment";

class FinanceController {
    static getBalance = async (req, res, next) => {
        try {
            const {user_id} = req;
            const driver = await Drivers.findOne({
                _id: user_id
            });
            res.status(200).json({
                balance: driver.balance
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
//
    static
    buyOrder = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {orderId} = req.query;
            const user = await Drivers.findOne({
                _id: user_id
            });

            const comission = mockOrdersData.commission / 100;
            // const order = await Orders.findOne({
            //     _id: orderId
            // });
            const balance = user.balance;
            if (balance < 1000 && balance < (comission * mockOrdersData.total_price)) return res.status(200).json({
                message: 'Пополните счёт.'
            });
            await Drivers.updateOne({
                _id: user
            }, {
                balance: balance - comission * mockOrdersData.total_price
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
    static
    replenishBalanceTinkoff = async (req, res, next) => {
        try {
            const {price} = req.body;
            const {user_id} = req;
            const response = await getPaymentUrl(price)
            return res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
//
    static
    replenishBalanceBase = async (req, res, next) => {
        try {
            const {price} = req.body;
            const {user_id} = req;
            await Drivers.updateOne({
                _id: user_id
            }, {
                $inc: {balance: price}
            })
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FinanceController;
