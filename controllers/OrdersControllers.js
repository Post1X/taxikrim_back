import TariffPrices from "../schemas/TariffPrices";
import {getAllOpenOrders} from "../api/getAllOpenOrders";
import {driverBuyOrder} from "../api/driverBuyOrder";
import {getOrderById} from "../api/getOrderById";
import Drivers from "../schemas/DriversSchema";
import {driverCloseOrder} from "../api/driverCloseOrder";
import io from 'socket.io-client'
import Fcm from "../schemas/FcmSchema";
import {appCreateOrder} from "../api/appCreateOrder";
import {getOrderByDriver} from "../api/getOrderByDriver";
import admin from "firebase-admin";
import {DateTime} from "luxon";

const time = process.env.DELAY_TIME;


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
                full_price,
                tariffId,
                countPeople,
                isBagage,
                isBaby,
                isBuster,
                isAnimal,
                comment,
                phone_number
            } = req.body;
            let order = {
                orderStart: from,
                orderFinish: to,
                orderStartUser: fulladressstart,
                orderFinishUser: fulladressend,
                orderTarif: tariffId,
                orderPeeple: countPeople,
                orderBags: isBagage,
                orderDate: date,
                order_buster: isBuster,
                order_animals: isAnimal,
                order_baby_chair: isBaby,
                orderTime: time,
                orderComment: comment,
                orderTel: phone_number,
                orderPrice: full_price
            };
            const response = await appCreateOrder(order);
            console.log(response);
            if (response.status === 'true') {
                const orderSocket = io.connect('http://localhost:3001/order/created');
                const urgentOrders = io.connect('http://localhost:3001/order/urgent');
                orderSocket.emit('created', response.order_id);
                orderSocket.once('response', (data) => {
                    console.log('Получен ответ от сервера:', data);
                });
                try {
                    const now = new Date();
                    const anotherOrdersResponse = await getAllOpenOrders();
                    if (!anotherOrdersResponse || !anotherOrdersResponse.orders || anotherOrdersResponse.orders.length === 0) {
                        console.log('Нет новых заказов');
                        return 'Нет новых заказов';
                    }
                    const anotherOrders = anotherOrdersResponse.orders;
                    const filteredAnotherOrders = anotherOrders.filter(order => {
                        const orderDateParts = order.order_date.split('.');
                        const orderDate = new Date(`${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`);
                        orderDate.setDate(orderDate.getDate() + 1);
                        if (orderDate > now && order.order_status === 'На продаже') {
                            const orderTime = order.order_time.split(':');
                            const orderHour = parseInt(orderTime[0]);
                            const orderMinute = parseInt(orderTime[1]);
                            if (orderHour > now.getHours() || (orderHour === now.getHours() && orderMinute >= now.getMinutes())) {
                                return true;
                            }
                        }
                        return false;
                    });
                    const allFilteredOrders = [...filteredAnotherOrders];
                    if (allFilteredOrders.length === 0) {
                        console.log('Не найдено');
                    } else {
                        console.log('Найдено');
                        const users = await Fcm.find();
                        let tokenSet = new Set();
                        users.forEach((item) => {
                            if (item.is_driver === true) {
                                tokenSet.add(item.token);
                            }
                        });
                        let uniqueTokens = Array.from(tokenSet);
                        const message = {
                            notification: {
                                title: "УСПЕЙ ВЗЯТЬ!",
                                body: "Появились срочные заказы"
                            },
                            tokens: uniqueTokens
                        };
                        await admin.messaging()
                            .sendMulticast(message)
                            .catch((error) => {
                                throw error;
                            });
                        urgentOrders.emit('found', allFilteredOrders);
                    }
                    const usersUrgent = await Fcm.find({urgent: true, is_driver: true, token: {$exists: true}});
                    const tokenSetUrgent = new Set(usersUrgent.map(item => item.token));
                    const uniqueTokensUrgent = Array.from(tokenSetUrgent);
                    if (uniqueTokensUrgent.length > 0) {
                        const messageUrgent = {
                            notification: {
                                title: "Новый заказ",
                                body: "Спеши забрать"
                            },
                            tokens: uniqueTokensUrgent
                        };
                        await admin.messaging().sendMulticast(messageUrgent);
                        console.log('Срочные уведомления были отправлены');
                        const delayForNonUrgent = time * 60 * 1000;
                        await new Promise(resolve => setTimeout(resolve, delayForNonUrgent));
                        const usersNonUrgent = await Fcm.find({urgent: false, is_driver: true, token: {$exists: true}});
                        const tokenSetNonUrgent = new Set(usersNonUrgent.map(item => item.token));
                        const uniqueTokensNonUrgent = Array.from(tokenSetNonUrgent);
                        if (uniqueTokensNonUrgent.length > 0) {
                            const messageNonUrgent = {
                                notification: {
                                    title: "Новый заказ",
                                    body: "Есть новый заказ"
                                },
                                tokens: uniqueTokensNonUrgent
                            };
                            await admin.messaging().sendMulticast(messageNonUrgent);
                            console.log('Не срочные уведомления были отправлены');
                            const orderSocket = io.connect('http://localhost:3001/order/created');
                            orderSocket.emit('created', response.order_id);
                            orderSocket.once('response', (data) => {
                                console.log('Получен ответ от сервера:', data);
                            });
                            res.status(200).json(response);
                        } else {
                            console.log('Нет токенов для несрочных уведомлений. Проход дальше.');
                            res.status(200).json(response);
                        }
                    } else {
                        console.log('Нет токенов для срочных уведомлений. Проход дальше.');
                        res.status(200).json(response);
                    }
                } catch (error) {
                    console.error('Ошибка при обработке заказа:', error);
                    res.status(500).json({error: 'Internal Server Error'});
                }
            } else {
                res.status(400).json({
                    message: 'Создание заказа прошло безуспешно.'
                });
            }

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static aaa = async (req, res, next) => {
        try {
            const now = new Date();
            const anotherOrdersResponse = await getAllOpenOrders();
            if (!anotherOrdersResponse || !anotherOrdersResponse.orders || anotherOrdersResponse.orders.length === 0) {
                console.log('Нет новых заказов');
                return 'Нет новых заказов';
            }
            const anotherOrders = anotherOrdersResponse.orders;
            const filteredAnotherOrders = anotherOrders.filter(order => {
                try {
                    const orderDateParts = order.order_date.split('.');
                    const orderDate = new Date(`${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]} ${order.order_time}`);
                    const timeDifference = orderDate.getTime() - now.getTime();
                    return timeDifference > 0 && timeDifference <= 2 * 60 * 60 * 1000 && order.order_status === 'На продаже';
                } catch (error) {
                    console.error('Ошибка при фильтрации заказов:', error);
                    return false;
                }
            });
            res.status(200).json(filteredAnotherOrders ? filteredAnotherOrders : 'Не найдено')
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
        const {from, to, tariff, priceFrom, priceTo} = req.query;
        try {
            const {user_id} = req;
            const user = await Drivers.findOne({
                _id: user_id
            });
            console.log(user_id);
            let ordersArr = await getAllOpenOrders();
            console.log(await getAllOpenOrders())
            if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
                return res.status(200).json({
                    count_orders: 0,
                    status: 'true',
                    message: 'Не найдено.'
                });
            }
            const orders = ordersArr.orders;
            const isNewOrder = (order) => {
                const orderCreateDate = DateTime.fromFormat(order.order_create_date, 'yyyy-MM-dd HH:mm:ss', {zone: 'Europe/Moscow'});
                const nowLocal = DateTime.local();
                console.log(nowLocal.toFormat('HH:mm:ss'), 'now (Local)');
                console.log(orderCreateDate.toFormat('HH:mm:ss'), 'order');
                const minutesDifference = nowLocal.diff(orderCreateDate).as('minutes');
                console.log(minutesDifference);
                return Math.abs(minutesDifference) >= 2;
            };
            if (user.subToUrgent === false) {
                ordersArr.orders = ordersArr.orders.filter(order => isNewOrder(order));
            }
            if (from) {
                ordersArr.orders = ordersArr.filter(order => order.order_start.toLowerCase().includes(from.toLowerCase()));
            }
            if (to) {
                ordersArr.orders = ordersArr.filter(order => order.order_end.toLowerCase().includes(to.toLowerCase()));
            }
            if (tariff) {
                ordersArr.orders = ordersArr.filter(order => order.order_tarif.toLowerCase() === tariff.toLowerCase());
            }
            if (priceFrom || priceTo) {
                ordersArr.orders = ordersArr.filter(order => {
                    const orderPrice = parseInt(order.order_price);
                    const fromPrice = priceFrom ? parseInt(priceFrom) : null;
                    const toPrice = priceTo ? parseInt(priceTo) : null;

                    if (fromPrice && toPrice) {
                        return orderPrice >= fromPrice && orderPrice <= toPrice;
                    } else if (fromPrice) {
                        return orderPrice >= fromPrice;
                    } else if (toPrice) {
                        return orderPrice <= toPrice;
                    }
                    return true;
                });
            }
            const response = {
                orders: ordersArr.orders ? ordersArr.orders : [],
                count_orders: ordersArr.orders ? ordersArr.orders.length : 0,
                status: 'true'
            };
            return res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrdersForDriver = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await getOrderByDriver(user_id);
            let response;
            if (orders)
                response = orders
            else
                response = [];
            res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
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
            const statusSocket = io.connect('http://localhost:3001/order/status');
            const {user_id} = req;
            const {order_id} = req.query;
            const order = await getOrderById(order_id);
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const commission = parseInt(order.orders[0].order_commission, 10);
            const price = Math.round((order.orders[0].order_price * commission) / 100)
            const balance = driver.balance;
            if ((balance - price) < 0)
                return res.status(400).json({
                    message: `Для того чтобы взять заказ, вам не хватает: ${-(balance - price)}₽`
                });
            else {
                const request = await driverBuyOrder(order_id, user_id);
                await Drivers.updateOne({
                    _id: user_id
                }, {
                    balance: (balance - price)
                })
                statusSocket.emit('changed', order);
                statusSocket.once('response', (data) => {
                    console.log('Получен ответ от сервера:', data);
                });
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
    //
    static getUrgentOrders = async (req, res, next) => {
        try {
            const now = new Date();
            const anotherOrdersResponse = await getAllOpenOrders();
            if (!anotherOrdersResponse || !anotherOrdersResponse.orders || anotherOrdersResponse.orders.length === 0) {
                res.status(200).json({
                    message: 'Нет заказов на данный момент.'
                });
            }
            const anotherOrders = anotherOrdersResponse.orders;
            const filteredAnotherOrders = anotherOrders.filter(order => {
                const orderDateParts = order.order_date.split('.');
                const orderDate = new Date(`${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`);
                orderDate.setDate(orderDate.getDate() + 1);
                if (orderDate > now && order.order_status === 'На продаже') {
                    const orderTime = order.order_time.split(':');
                    const orderHour = parseInt(orderTime[0]);
                    const orderMinute = parseInt(orderTime[1]);
                    if (orderHour > now.getHours() || (orderHour === now.getHours() && orderMinute >= now.getMinutes())) {
                        return true;
                    }
                }
                return false;
            });

            const allFilteredOrders = [...filteredAnotherOrders];
            if (allFilteredOrders.length === 0) {
                res.status(200).json({
                    message: 'Не найдено'
                });
            } else {
                res.status(200).json(allFilteredOrders);
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getArchive = async (req, res, next) => {
        try {
            const {user_id} = req;
            const response = await getOrderByDriver(user_id);
            if (response.error_message === "У водителя еще нет заказов")
                return res.status(300).json([]);
            res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static createdOrder = async (req, res, next) => {
        try {
            const {id} = req.query;
            const orderSocket = io.connect('http://localhost:3001/order/created');
            // const urgentOrders = io.connect('http://localhost:3001/order/urgent');
            orderSocket.emit('created', id);
            orderSocket.once('response', (data) => {
                console.log('Получен ответ от сервера:', data);
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersControllers;
