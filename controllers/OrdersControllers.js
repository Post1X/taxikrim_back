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
import {getDispetcherById} from "../api/getDispetcherById";

const timeDelay = process.env.DELAY_TIME;


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
            console.log(isBagage,
                isBaby,
                isBuster,
                isAnimal);
            const order = {
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
            const orderSocket = io.connect('http://localhost:3001/order/created');
            const urgentSocket = io.connect('http://localhost:3001/order/urgent');
            const response = await appCreateOrder(order);
            console.log(response);
            orderSocket.emit('created', response.order_id);
            const nowMoscow = DateTime.local().setZone('Europe/Moscow');
            const ordersArr = await getAllOpenOrders();
            if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
                console.log('Не найдено');
                next();
                return;
            }
            const filterOrdersByTime = (order) => {
                const orderDateParts = order.order_date.split('.');
                const orderDate = DateTime.fromFormat(
                    `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]} ${order.order_time}`,
                    'yyyy-MM-dd HH:mm',
                    {zone: 'Europe/Moscow'}
                );
                if (orderDate > nowMoscow && order.order_status === 'На продаже') {
                    const timeDifferenceInHours = orderDate.diff(nowMoscow).as('hours');
                    return timeDifferenceInHours <= timeDelay;
                }
                return false;
            };
            const filteredOrders = (await Promise.all(
                ordersArr.orders
                    .filter(order => filterOrdersByTime(order))
                    .map(async order => {
                        const dispatch = await getDispetcherById(order.order_dispatcher);
                        order.order_dispatcher = {
                            dispatcher_name: dispatch.dispetcher.dispetcher_name,
                            dispatcher_image: dispatch.dispetcher.dispetcher_image,
                            dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                            dispatcher_email: dispatch.dispetcher.dispetcher_email,
                            dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                        };
                        return filterOrdersByTime(order) ? order : null;
                    })
            )).filter(order => order !== null);
            if (filteredOrders.length === 0) {
                const users = await Fcm.find();
                const tokenSet = new Set();
                const urgentTokenSet = new Set();
                const regularTokenSet = new Set();
                users.forEach((item) => {
                    if (item.is_driver === true) {
                        tokenSet.add(item.token);
                        if (item.urgent === true) {
                            urgentTokenSet.add(item.token);
                        } else {
                            regularTokenSet.add(item.token);
                        }
                    }
                });
                const uniqueUrgentTokens = Array.from(urgentTokenSet);
                const uniqueRegularTokens = Array.from(regularTokenSet);
                const sendNotification = async (tokens, message) => {
                    try {
                        await admin.messaging().sendMulticast({
                            notification: {
                                title: message.title,
                                body: message.body
                            },
                            tokens: tokens
                        });
                    } catch (error) {
                        console.error('Ошибка при отправке уведомления:', error);
                    }
                };
                //
                await sendNotification(uniqueUrgentTokens, {
                    title: "Новые заказы",
                    body: "Появились новые заказы",
                    sound: "default"
                });
                setTimeout(() => {
                    (async () => {
                        await sendNotification(uniqueRegularTokens, {
                            title: "Новые заказы",
                            body: "Появились новые заказы",
                            sound: "default"
                        });
                    })();
                }, 60000);
                //
            } else {
                console.log('Найдено');
                const users = await Fcm.find();
                const tokenSet = new Set();
                const urgentTokenSet = new Set();
                const regularTokenSet = new Set();
                users.forEach((item) => {
                    if (item.is_driver === true) {
                        tokenSet.add(item.token);
                        if (item.subToUrgent) {
                            urgentTokenSet.add(item.token);
                        } else {
                            regularTokenSet.add(item.token);
                        }
                    }
                });
                const uniqueUrgentTokens = Array.from(urgentTokenSet);
                const uniqueRegularTokens = Array.from(regularTokenSet);
                const sendNotification = async (tokens, message) => {
                    try {
                        await admin.messaging().sendMulticast({
                            notification: {
                                title: message.title,
                                body: message.body
                            },
                            tokens: tokens
                        });
                    } catch (error) {
                        console.error('Ошибка при отправке уведомления:', error);
                    }
                };
                await sendNotification(uniqueUrgentTokens, {
                    title: "УСПЕЙ ВЗЯТЬ!",
                    body: "Появились срочные заказы",
                    sound: "default"
                });
                setTimeout(() => {
                    (async () => {
                        await sendNotification(uniqueRegularTokens, {
                            title: "УСПЕЙ ВЗЯТЬ!",
                            body: "Появились срочные заказы",
                            sound: "default"
                        });
                    })();
                }, 60000);
                await urgentSocket.emit('found', filteredOrders);
                return res.status(200).json({
                    message: 'success'
                });
            }
            return res.status(200).json({
                message: 'success'
            })
        } catch (error) {
            console.error('Ошибка при обработке заказа:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    };
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
    static getOrders = async (req, res, next) => {
        const {from, to, tariff, priceFrom, priceTo} = req.query;
        const {user_id} = req;
        try {
            const isNewOrder = (order) => {
                const orderCreateDate = DateTime.fromFormat(order.order_create_date, 'yyyy-MM-dd HH:mm:ss', {zone: 'Europe/Moscow'});
                const nowMoscow = DateTime.local().setZone('Europe/Moscow');
                const minutesDifference = nowMoscow.diff(orderCreateDate).as('minutes');
                return Math.abs(minutesDifference) <= 2;
            };

            const nowMoscow = DateTime.local().setZone('Europe/Moscow');
            const ordersArr = await getAllOpenOrders();

            if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
                return res.status(200).json([]);
            }
            const user = await Drivers.findOne({
                _id: user_id
            });
            const isSubbed = user.subToUrgent;
            const filterOrdersByTime = async (order) => {
                const orderDateParts = order.order_date.split('.');
                const orderDate = DateTime.fromFormat(
                    `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]} ${order.order_time}`,
                    'yyyy-MM-dd HH:mm',
                    {zone: 'Europe/Moscow'}
                );
                if (orderDate > nowMoscow && order.order_status === 'На продаже') {
                    const timeDifferenceInHours = orderDate.diff(nowMoscow).as('hours');
                    return timeDifferenceInHours <= time;
                }
                return false;
            };
            const filterOrdersByPrice = (order) => {
                const numericPrice = parseFloat(order.order_price);
                if (priceFrom && priceTo) {
                    return numericPrice >= parseFloat(priceFrom) && numericPrice <= parseFloat(priceTo);
                } else if (priceFrom) {
                    return numericPrice >= parseFloat(priceFrom);
                } else if (priceTo) {
                    return numericPrice <= parseFloat(priceTo);
                }
                return true;
            };
            const filteredOrders = await Promise.all(ordersArr.orders
                .filter(order => filterOrdersByTime(order))
                .filter(order => (from ? order.order_start === from : true))
                .filter(order => (to ? order.order_end === to : true))
                .filter(order => (tariff ? order.order_tarif === tariff : true))
                .filter(order => filterOrdersByPrice(order))
                .map(async (order) => {
                    const dispatch = await getDispetcherById(order.order_dispatcher);
                    order.order_dispatcher = {
                        dispatcher_name: dispatch.dispetcher.dispetcher_name,
                        dispatcher_image: dispatch.dispetcher.dispetcher_image,
                        dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                        dispatcher_email: dispatch.dispetcher.dispetcher_email,
                        dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                    };
                    return order;
                }));
            const finalFilteredOrders = await Promise.all(isSubbed
                ? filteredOrders
                : ordersArr.orders
                    .filter(order => !isNewOrder(order))
                    .map(async (order) => {
                        const dispatch = await getDispetcherById(order.order_dispatcher);
                        order.order_dispatcher = {
                            dispatcher_name: dispatch.dispetcher.dispetcher_name,
                            dispatcher_image: dispatch.dispetcher.dispetcher_image,
                            dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                            dispatcher_email: dispatch.dispetcher.dispetcher_email,
                            dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                        };
                        return order;
                    }));
            const response = {
                orders: finalFilteredOrders.filter(Boolean) || [],
                count_orders: finalFilteredOrders.filter(Boolean).length,
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
            const response = await getOrderByDriver(user_id);

            if (response.error_message === "У водителя еще нет заказов") {
                return res.status(300).json([]);
            }

            const filteredOrders = response.orders.filter(order => order.order_status === 'Выполняется');

            await Promise.all(filteredOrders.map(async (order) => {
                const dispatch = await getDispetcherById(order.order_dispatcher);
                order.order_dispatcher = {
                    dispatcher_name: dispatch.dispetcher.dispetcher_name,
                    dispatcher_image: dispatch.dispetcher.dispetcher_image,
                    dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                    dispatcher_email: dispatch.dispetcher.dispetcher_email,
                    dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                };
                return order;
            }));

            res.status(200).json({
                status: "true",
                driver_id: user_id,
                orders: filteredOrders,
                count_orders: filteredOrders.length
            });
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
            console.log(order.orders[0].order_status)
            if ((balance - price) < 0) {
                return res.status(400).json({
                    message: `Для того чтобы взять заказ, вам не хватает: ${-(balance - price)}₽`
                });
            } else {
                if (order && order.orders[0].order_status === 'Выполняется') {
                    return res.status(400).json({
                        error_message: 'Заказ уже куплен!'
                    })
                }
                const request = await driverBuyOrder(order_id, user_id);
                if (request.error_message === 'Заказ уже куплен') {
                    console.log('hello')
                    return res.status(400).json({
                        error_message: 'Заказ уже куплен!'
                    })
                }
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
            if (request.error_message === "Вы не можете завершить заказ который еще не начался") {
                console.log('helloworld')
                return res.status(400).json({
                    error_message: "Вы не можете завершить заказ который еще не начался."
                });
            }
            return res.status(200).json(request);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getUrgentOrders = async (req, res, next) => {
        const {from, to, tariff, priceFrom, priceTo} = req.query;
        const {user_id} = req;
        try {
            const isNewOrder = (order) => {
                const orderCreateDate = DateTime.fromFormat(order.order_create_date, 'yyyy-MM-dd HH:mm:ss', {zone: 'Europe/Moscow'});
                const nowMoscow = DateTime.local().setZone('Europe/Moscow');
                const minutesDifference = nowMoscow.diff(orderCreateDate).as('minutes');
                return Math.abs(minutesDifference) <= 2;
            };

            const nowMoscow = DateTime.local().setZone('Europe/Moscow');
            const ordersArr = await getAllOpenOrders();

            if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
                return res.status(200).json([]);
            }
            const user = await Drivers.findOne({
                _id: user_id
            });
            const isSubbed = user.subToUrgent;
            const filterOrdersByTime = (order) => {
                const orderDateParts = order.order_date.split('.');
                const orderDate = DateTime.fromFormat(
                    `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]} ${order.order_time}`,
                    'yyyy-MM-dd HH:mm',
                    {zone: 'Europe/Moscow'}
                );
                if (orderDate > nowMoscow && order.order_status === 'На продаже') {
                    const timeDifferenceInHours = orderDate.diff(nowMoscow).as('hours');
                    return timeDifferenceInHours <= timeDelay;
                }

                return false;
            };
            const filterOrdersByPrice = (order) => {
                const numericPrice = parseFloat(order.order_price);

                if (priceFrom && priceTo) {
                    return numericPrice >= parseFloat(priceFrom) && numericPrice <= parseFloat(priceTo);
                } else if (priceFrom) {
                    return numericPrice >= parseFloat(priceFrom);
                } else if (priceTo) {
                    return numericPrice <= parseFloat(priceTo);
                }
                return true;
            };
            const filteredOrders = await Promise.all(ordersArr.orders
                .filter(order => filterOrdersByTime(order))
                .filter(order => (from ? order.order_start === from : true))
                .filter(order => (to ? order.order_end === to : true))
                .filter(order => (tariff ? order.order_tarif === tariff : true))
                .filter(order => filterOrdersByPrice(order))
                .map(async (order) => {
                    const dispatch = await getDispetcherById(order.order_dispatcher);
                    order.order_dispatcher = {
                        dispatcher_name: dispatch.dispetcher.dispetcher_name,
                        dispatcher_image: dispatch.dispetcher.dispetcher_image,
                        dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                        dispatcher_email: dispatch.dispetcher.dispetcher_email,
                        dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                    };
                    return order;
                }));
            const finalFilteredOrders = await Promise.all(isSubbed
                ? filteredOrders
                : ordersArr.orders
                    .filter(order => !isNewOrder(order))
                    .map(async (order) => {
                        const dispatch = await getDispetcherById(order.order_dispatcher);
                        order.order_dispatcher = {
                            dispatcher_name: dispatch.dispetcher.dispetcher_name,
                            dispatcher_image: dispatch.dispetcher.dispetcher_image,
                            dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                            dispatcher_email: dispatch.dispetcher.dispetcher_email,
                            dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                        };
                        return order;
                    }));
            const response = {
                orders: finalFilteredOrders.filter(Boolean) || [],
                count_orders: finalFilteredOrders.filter(Boolean).length,
                status: 'true'
            };
            return res.status(200).json(response);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
    //
    static getArchive = async (req, res, next) => {
        try {
            const {user_id} = req;
            const response = await getOrderByDriver(user_id);
            if (response.error_message === "У водителя еще нет заказов")
                return res.status(300).json([]);
            await Promise.all(response.orders.map(async (order) => {
                const dispatch = await getDispetcherById(order.order_dispatcher);
                order.order_dispatcher = {
                    dispatcher_name: dispatch.dispetcher.dispetcher_name,
                    dispatcher_image: dispatch.dispetcher.dispetcher_image,
                    dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                    dispatcher_email: dispatch.dispetcher.dispetcher_email,
                    dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                };
                return order;
            }));
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
