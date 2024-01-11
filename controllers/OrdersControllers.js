import OrderStatuses from "../schemas/OrderStatusesSchema";
import Orders from "../schemas/OrdersSchema";
import TariffPrices from "../schemas/TariffPrices";
import {getAllOpenOrders} from "../api/getAllOpenOrders";
import {driverBuyOrder} from "../api/driverBuyOrder";
import {getOrderById} from "../api/getOrderById";
import Drivers from "../schemas/DriversSchema";
import {driverCloseOrder} from "../api/driverCloseOrder";
import io from 'socket.io-client'
import Fcm from "../schemas/FcmSchema";
import admin from "firebase-admin";
import {appCreateOrder} from "../api/appCreateOrder";

class OrdersControllers {
    static PlaceOrder = async (req, res, next) => {
        try {
            const orderSocket = io.connect('http://localhost:3001/order/created');
            const {
                from,
                to,
                fulladressend,
                fulladressstart,
                date,
                time,
                full_price,
                tariffId,
                paymentMethod,
                countPeople,
                isBagage,
                isBaby,
                isBuster,
                isAnimal,
                comment,
                phone_number
            } = req.body;
            const {user_id} = req;
            const comission = 30;
            const status = '64e783585c0ccd9eb28373d4';
            let order = {
                orderStart: from,
                orderFinish: to,
                orderStartUser: fulladressstart,
                orderFinishUser: fulladressend,
                orderTarif: tariffId,
                orderPeeple: countPeople,
                orderBags: isBagage,
                orderDate: date,
                orderTime: time,
                orderComment: comment,
                orderTel: phone_number,
                orderPrice: full_price
            };
            const response = await appCreateOrder(order);
            const newOrder = new Orders({
                destination_start: from,
                destination_end: to,
                full_address_end: fulladressend,
                full_address_start: fulladressstart,
                date: date,
                time: time,
                total_amount: full_price,
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
                dispatcher: 11,
                status: 'На продаже',
                id: response.order_id
            });
            const users = await Fcm.find();
            let token_array = [];
            users.map((item) => {
                console.log(item);
                if (item.is_driver === true)
                    token_array.push(item.token);
            });
            const message = {
                notification: {
                    title: "Новый заказ",
                    body: "Спеши забрать"
                },
                tokens: token_array
            };
            await admin.messaging()
                .sendMulticast(message)
                .then(() => {
                    console.log('was sent')
                })
                .catch((error) => {
                    throw error;
                });
            await newOrder.save();
            console.log(response.order_id)
            orderSocket.emit('created', {order_id: response.order_id});
            orderSocket.once('response', (data) => {
                console.log('Получен ответ от сервера:', data);
            });
            res.status(200).json(
                response,
                // 'as'
            )
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrder = async (req, res, next) => {
        try {
            const {orderId} = req.query;
            const orders = await getOrderById(orderId);
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
            console.log(order)
            const balance = driver.balance;
            if ((balance - order.orders[0].order_price) < 0)
                return res.status(400).json({
                    message: `Для того чтобы взять заказ, вам не хватает: ${-(balance - order.orders[0].order_price)}₽`
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
