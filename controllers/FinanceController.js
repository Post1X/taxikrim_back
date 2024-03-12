import Drivers from "../schemas/DriversSchema";
import {checkStatus, getPaymentUrl} from "../services/payment";
import TransactionsSchema from "../schemas/TransactionsSchema";

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
            const response = await getPaymentUrl(price, user_id)
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
    //
    static getAllTransactions = async (req, res, next) => {
        try {
            const {dateFrom, dateTo} = req.query;
            let filter = {};
            if (dateFrom && dateTo) {
                filter.date = {$gte: new Date(dateFrom), $lte: new Date(dateTo)};
            } else if (dateFrom) {
                filter.date = {$gte: new Date(dateFrom)};
            } else if (dateTo) {
                filter.date = {$lte: new Date(dateTo)};
            }
            const result = await TransactionsSchema.aggregate([
                {$match: filter},
                {
                    $group: {
                        _id: "$type",
                        totalAmount: {$sum: "$price"}
                    }
                }
            ]);
            const regular_count = await TransactionsSchema.count({
                type: "regular"
            })
            const urgent_count = await TransactionsSchema.count({
                type: "urgent"
            })
            const totalAmounts = result.reduce((acc, curr) => {
                if (curr._id === "regular") {
                    acc.regular_count = regular_count;
                } else if (curr._id === "urgent") {
                    acc.urgent_count = urgent_count;
                }
                acc[curr._id] = curr.totalAmount;
                return acc;
            }, {});
            res.status(200).json(totalAmounts);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static checkStatus = async (req, res, next) => {
        try {
            const check = await checkStatus();
            res.status(200).json(check);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FinanceController;
