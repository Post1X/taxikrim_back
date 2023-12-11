import Drivers from "../schemas/DriversSchema";

class FinanceController {
    static getBalance = async (req, res, next) => {
        try {
            const {user_id} = req;
            // const balance = await tinkoff.findBalanceForThis(userid);
            await Drivers.updateOne({
                _id: user_id
            }, {
                balance: 25000
            });
            res.status(200).json(
                {
                    balance: 25000
                }
            )
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static buyOrder = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {orderId} = req.query;
            const user = await Drivers.findOne({
                _id: user_id
            });
            const mockOrdersData = {
                destination_start: 'Starting Point A',
                destination_end: 'Destination Point X',
                full_address_start: '123 Main Street, City A',
                full_address_end: '456 Elm Street, City X',
                date: new Date('2023-12-01T08:00:00Z'),
                time: '10:30 AM',
                car_type: 'Luxury',
                baggage_count: 2,
                body_count: 3,
                animals: true,
                booster: false,
                kid: true,
                comment: 'Special instructions for the driver',
                total_price: 75.5,
                commission: 10,
                driver: '60d5ebf7e9c7f96d6a0f8ea1',
                paymentMethod: 'Credit Card',
                dispatcher: '60d5ebf7e9c7f96d6a0f8ea2',
                status: '60d5ebf7e9c7f96d6a0f8ea3'
            };
            const comission = mockOrdersData.commission / 100;
            // const order = await Orders.findOne({
            //     _id: orderId
            // });
            const balance = user.balance;
            if (balance < 1000 && balance < (comission * mockOrdersData.total_price))
                return res.status(200).json({
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
    static replenishBalanceTinkoff = async (req, res, next) => {
        try {
            const {price} = req.body;
            // await tinkoffaction
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static replenishBalanceBase = async (req, res, next) => {
        try {
            const {price} = req.body;
            const {user_id} = req;
            const user = await Drivers.findOne({
                _id: user_id
            });
            const balance = user.balance;
            await Drivers.updateOne({
                _id: user_id
            }, {
                balance: balance + price
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FinanceController;
