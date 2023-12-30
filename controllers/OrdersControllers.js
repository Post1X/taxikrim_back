import OrderStatuses from "../schemas/OrderStatusesSchema";
import Orders from "../schemas/OrdersSchema";
import TariffPrices from "../schemas/TariffPrices";
import {getAllOpenOrders} from "../api/getAllOpenOrders";
import {driverBuyOrder} from "../api/driverBuyOrder";
import {getOrderById} from "../api/getOrderById";
import Drivers from "../schemas/DriversSchema";
import {driverCloseOrder} from "../api/driverCloseOrder";

class OrdersControllers {
    static PlaceOrder = async (req, res, next) => {
        try {
            const {
                from,
                to,
                fulladressend,
                fulladressstart,
                date,
                time,
                tariffId,
                paymentMethod,
                countPeople,
                isBagage,
                isBaby,
                isBuster,
                isAnimal,
                comment
            } = req.body;
            const {user_id} = req;
            const comission = 30;
            const distance_price = 5000;
            const status = '64e783585c0ccd9eb28373d4';
            let price = distance_price;
            if (countPeople <= 5) {
                price += 1500;
            }
            if (countPeople > 5) {
                price += 2500;
            }
            if (isBagage <= 5) {
                price += 200;
            }
            if (isBagage > 5) {
                price += 500;
            }
            if (isBaby) {
                price += 500;
            }
            if (isBuster) {
                price += 300;
            }
            if (isAnimal) {
                price += 400;
            }
            const newOrder = new Orders({
                destination_start: from,
                destination_end: to,
                full_address_end: fulladressend,
                full_address_start: fulladressstart,
                date: date,
                time: time,
                car_type: tariffId,
                paymentMethod: paymentMethod,
                client: user_id,
                comission: comission,
                baggage_count: isBagage,
                body_count: countPeople,
                animals: isAnimal,
                booster: isBuster,
                kid: isBaby,
                comment: comment,
                dispatcher: user_id,
                status: status
            })
            await newOrder.save();
            res.status(200).json({
                price: price,
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrder = async (req, res, next) => {
        try {
            const {orderId} = req.query;
            const orders =  await getOrderById(orderId);
            res.status(200).json(orders);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrders = async (req, res, next) => {
        try {
            // const {user_id} = req;
            const orders = await Orders.find({});
            return res.status(200).json(await getAllOpenOrders());
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrdersForDriver = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await getAllOpenOrders();
            const filtered = orders.orders.filter(item => item.order_driver === user_id);
            res.status(200).json(filtered ? filtered : null);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static asasa = async (req, res, next) => {
        const {title} = req.query;
        const newStatus = new OrderStatuses({
            title: title
        })
        await newStatus.save();
    }
    //
    static createTariff = async (req, res, next) => {
        try {
            const {type, price, km} = req.body;
            const newTariff = new TariffPrices({
                type: type,
                price: price,
                km: !!km
            });
            await newTariff.save();
            res.status(200).json({
                message: true
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static buyOrder = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {order_id} = req.query;
            const order = await getOrderById(order_id);
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const balance = driver.balance;
            if ((balance - order.orders[0].order_price) < 1500)
                return res.status(400).json({
                    message: "Пожалуйста, пополните баланс для совершения операции."
                });
            else {
                const request = await driverBuyOrder(order_id, user_id);
                await Drivers.updateOne({
                    _id: user_id
                }, {
                    balance: (balance - order.orders[0].order_price)
                })
                return res.status(200).json(request);
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static closeOrder = async (req, res, next) => {
        try {
            const {orderId} = req.query;
            const request = await driverCloseOrder(orderId);
            return res.status(200).json(request);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersControllers;
