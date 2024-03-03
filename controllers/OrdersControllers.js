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
                isUrgent,
                additional,
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
            const addString = additional.join('|');
            console.log(addString);
            const order = {
                orderStart: from,
                orderFinish: to,
                orderStartUser: fulladressstart,
                orderFinishUser: fulladressend,
                orderTarif: tariffId,
                orderPeeple: countPeople,
                orderBags: isBagage,
                orderDate: date,
                isUrgent: isUrgent + "",
                orderBuster: isBuster + "",
                orderPet: isAnimal + "",
                orderBabyChair: isBaby + "",
                orderTime: time,
                additional: addString,
                orderComment: comment,
                orderTel: phone_number,
                orderPrice: full_price
            };
            if ((tariffId === "Стандарт" || tariffId === "Комфорт") && countPeople > 4)
                return res.status(300).json({
                    message: 'Максимум пассажиров: 4'
                })
            if (tariffId === "Бизнес" && countPeople > 3)
                return res.status(300).json({
                    message: "Максимум пассажиров: 3"
                })
            if (tariffId === "Минивэн" && countPeople > 6)
                return res.status(300).json({
                    message: "Максимум пассажиров: 8"
                })
            const orderSocket = io.connect('http://localhost:3001/order/created');
            const urgentSocket = io.connect('http://localhost:3001/order/urgent');
            const response = await appCreateOrder(order);
            if (response.error_message !== 'Невозможно создать заказ на дату которая уже прошла') {
                if (isUrgent === false) {
                    console.log('dpakwopdkasopkdopaw')
                    orderSocket.emit('created', response.order_id);
                }
                const nowMoscow = DateTime.local().setZone('Europe/Moscow');
                const ordersArr = await getAllOpenOrders();
                if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
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
                        return timeDifferenceInHours < 2 || JSON.parse(order.isUrgent) === true;
                    }
                    return false;
                };
                const filteredOrders = (await Promise.all(
                    ordersArr.orders
                        .filter(order => filterOrdersByTime(order))
                    // .map(async order => {
                    //     const dispatch = await getDispetcherById(order.order_dispatcher);
                    //     order.order_dispatcher = {
                    //         dispatcher_name: dispatch.dispetcher.dispetcher_name,
                    //         dispatcher_image: dispatch.dispetcher.dispetcher_image,
                    //         dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                    //         dispatcher_email: dispatch.dispetcher.dispetcher_email,
                    //         dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                    //     };
                    //     return filterOrdersByTime(order) ? order : null;
                    // })
                )).filter(order => order !== null);
                if (filteredOrders.length === 0 && isUrgent === false) {
                    const users = await Fcm.find();
                    const urgentTokenSet = new Set();
                    const regularTokenSet = new Set();
                    users.forEach((item) => {
                        if (item.is_driver === true && item.notification === true) {
                            const isTariffCompatible = (driverTariff, orderTariff) => {
                                switch (driverTariff) {
                                    case "Стандарт":
                                        return orderTariff === "Стандарт";
                                    case "Комфорт":
                                        return orderTariff === "Стандарт" || orderTariff === "Комфорт";
                                    case "Бизнес":
                                        return orderTariff === "Стандарт" || orderTariff === "Комфорт" || orderTariff === "Бизнес";
                                    case "Минивэн":
                                        return orderTariff === "Минивэн" || orderTariff === "Стандарт" || orderTariff === "Комфорт" || orderTariff === "Бизнес";
                                    default:
                                        return false;
                                }
                            };
                            if (isTariffCompatible(item.user_tariff, tariffId)) {
                                if (item.urgent === true) {
                                    urgentTokenSet.add(item.token);
                                } else {
                                    regularTokenSet.add(item.token);
                                }
                            }
                        }
                    });
                    const uniqueUrgentTokens = Array.from(urgentTokenSet);
                    const uniqueRegularTokens = Array.from(regularTokenSet);
                    const sendNotification = async (tokens, message) => {
                        for (const token of tokens) {
                            try {
                                await admin.messaging().send({
                                    notification: {
                                        title: message.title,
                                        body: message.body,
                                    },
                                    android: {
                                        notification: {
                                            sound: 'new_message.mp3',
                                            channelId: "custom_sound_channel",
                                            priority: "high",
                                        },
                                    },
                                    apns: {
                                        payload: {
                                            aps: {
                                                sound: 'new_message.mp3'
                                            },
                                        },
                                        headers: {
                                            "apns-priority": "10"
                                        },
                                    },
                                    token: token
                                });
                            } catch (error) {
                                console.error('Error sending notification:', error);
                            }
                        }
                    };
                    //
                    if (uniqueUrgentTokens.length > 0) {
                        await sendNotification(uniqueUrgentTokens, {
                            title: "Новые заказы",
                            body: "Появились новые заказы",
                            // sound: "default"
                        });
                    }
                    if (uniqueRegularTokens.length > 0) {
                        setTimeout(() => {
                            (async () => {
                                await sendNotification(uniqueRegularTokens, {
                                    title: "Новые заказы",
                                    body: "Появились новые заказы",
                                    // sound: "default"
                                });
                            })();
                        }, 60000);
                    }
                    //
                }
                if (filteredOrders.length > 0 || isUrgent === true) {
                    const users = await Fcm.find();
                    const tokenSet = new Set();
                    const urgentTokenSet = new Set();
                    const regularTokenSet = new Set();
                    users.forEach((item) => {
                        if (item.is_driver === true && item.notification === true) {
                            const isTariffCompatible = (driverTariff, orderTariff) => {
                                switch (driverTariff) {
                                    case "Стандарт":
                                        return orderTariff === "Стандарт";
                                    case "Комфорт":
                                        return orderTariff === "Стандарт" || orderTariff === "Комфорт";
                                    case "Бизнес":
                                        return orderTariff === "Стандарт" || orderTariff === "Комфорт" || orderTariff === "Бизнес";
                                    case "Минивэн":
                                        return orderTariff === "Минивэн" || orderTariff === "Стандарт" || orderTariff === "Комфорт" || orderTariff === "Бизнес";
                                    default:
                                        return false;
                                }
                            };
                            if (isTariffCompatible(item.user_tariff, tariffId)) {
                                if (item.urgent === true) {
                                    urgentTokenSet.add(item.token);
                                } else {
                                    regularTokenSet.add(item.token);
                                }
                            }
                        }
                    });
                    const uniqueUrgentTokens = Array.from(urgentTokenSet);
                    const uniqueRegularTokens = Array.from(regularTokenSet);
                    const sendNotification = async (tokens, message) => {
                        for (const token of tokens) {
                            try {
                                await admin.messaging().send({
                                    notification: {
                                        title: message.title,
                                        body: message.body,
                                    },
                                    android: {
                                        notification: {
                                            sound: 'new_message.mp3',
                                            channelId: "custom_sound_channel",
                                            priority: "high",
                                        },
                                    },
                                    apns: {
                                        payload: {
                                            aps: {
                                                sound: 'new_message.mp3'
                                            },
                                        },
                                        headers: {
                                            "apns-priority": "10"
                                        },
                                    },
                                    token: token
                                });
                            } catch (error) {
                                console.error('Error sending notification:', error);
                            }
                        }
                    };
                    if (uniqueUrgentTokens.length > 0) {
                        await sendNotification(uniqueUrgentTokens, {
                            title: "УСПЕЙ ВЗЯТЬ!",
                            body: "Появились срочные заказы",
                        });
                    }
                    if (uniqueRegularTokens.length > 0) {
                        setTimeout(async () => {
                            await sendNotification(uniqueRegularTokens, {
                                title: "Новые заказы",
                                body: "Появились новые заказы",
                            });
                        }, 60000);
                    }
                    await urgentSocket.emit('found', filteredOrders);
                    return res.status(200).json({
                        message: 'success'
                    });
                }
                return res.status(200).json({
                    message: 'success'
                })
            } else {
                res.status(200).json({
                    message: response.error_message
                })
            }
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
        const {from, to, tariff, priceFrom, priceTo, dateFrom, dateTo} = req.query;
        const {user_id} = req;
        try {
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const tariffId = driver.tariffId;
            const isNewOrder = (order) => {
                const orderCreateDate = DateTime.fromFormat(order.order_create_date, 'yyyy-MM-dd HH:mm:ss', {zone: 'Europe/Moscow'});
                const nowMoscow = DateTime.local().setZone('Europe/Moscow');
                const minutesDifference = nowMoscow.diff(orderCreateDate).as('minutes');
                return Math.abs(minutesDifference) < 1;
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
                    return Math.round(timeDifferenceInHours) > 2 && JSON.parse(order.isUrgent) === false;
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
            const timeFilterResults = await Promise.all(
                ordersArr.orders.map(async order => await filterOrdersByTime(order))
            );

            function filterOrdersByDriverTariff(order, driverTariff) {
                switch (driverTariff) {
                    case "Стандарт":
                        return order.order_tarif === "Стандарт";
                    case "Комфорт":
                        return order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт";
                    case "Бизнес":
                        return order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт" || order.order_tarif === "Бизнес";
                    case "Минивэн":
                        return order.order_tarif === "Минивэн" || order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт" || order.order_tarif === "Бизнес"
                    default:
                        return false;
                }
            }

            const filteredOrders = await Promise.all(
                ordersArr.orders
                    .filter((order, index) => timeFilterResults[index])
                    .filter(order => !from || order.order_start === from)
                    .filter(order => !to || order.order_end === to)
                    .filter(order => !tariff || order.order_tarif === tariff)
                    .filter(order => filterOrdersByPrice(order))
                    .filter(order => {
                        const orderCreateDate = DateTime.fromFormat(order.order_create_date.split(' ')[0], 'yyyy-MM-dd', {zone: 'Europe/Moscow'});
                        if (dateFrom && !dateTo) {
                            const dateFromDT = DateTime.fromISO(dateFrom, {zone: 'Europe/Moscow'});
                            return orderCreateDate >= dateFromDT.startOf('day');
                        } else if (!dateFrom && dateTo) {
                            const dateToDT = DateTime.fromISO(dateTo, {zone: 'Europe/Moscow'});
                            return orderCreateDate <= dateToDT.endOf('day');
                        } else if (dateFrom && dateTo) {
                            const dateFromDT = DateTime.fromISO(dateFrom, {zone: 'Europe/Moscow'});
                            const dateToDT = DateTime.fromISO(dateTo, {zone: 'Europe/Moscow'});
                            return orderCreateDate >= dateFromDT.startOf('day') && orderCreateDate <= dateToDT.endOf('day');
                        }
                        return true;
                    })
                    .filter(order => filterOrdersByDriverTariff(order, tariffId))
                    .filter(order => isSubbed ? true : isNewOrder(order) === false)
                    .map(async (order) => {
                        const dispatch = await getDispetcherById(order.order_dispatcher);
                        if (dispatch && dispatch.dispetcher) {
                            order.order_dispatcher = {
                                dispatcher_name: dispatch.dispetcher.dispetcher_name,
                                dispatcher_image: dispatch.dispetcher.dispetcher_image,
                                dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                                dispatcher_email: dispatch.dispetcher.dispetcher_email,
                                dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                            };
                        }
                        return order;
                    })
            );
            const response = {
                orders: filteredOrders.filter(Boolean) || [],
                count_orders: filteredOrders.filter(Boolean).length,
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
                return res.status(200).json([]);
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
            const driverOrders = await getOrderByDriver(user_id);
            let filteredOrders;
            if (driverOrders.error_message !== "У водителя еще нет заказов") {
                filteredOrders = driverOrders.orders.filter(order => order.order_status === 'Выполняется');
                if (filteredOrders.length !== 0 && filteredOrders.length >= 1) {
                    return res.status(300).json({
                        message: 'У вас уже есть активный заказ.'
                    })
                }
            }
            if (order.error_message !== `Не найден заказ с order_id = ${order_id}`) {
                const commission = parseInt(order.orders[0].order_commission, 10);
                const price = Math.round((order.orders[0].order_price * commission) / 100)
                const balance = parseInt(driver.balance);
                console.log(order.orders[0].order_status)
                if ((balance - price) < 0) {
                    return res.status(400).json({
                        message: `Для того чтобы взять заказ, вам не хватает: ${-(balance - price)}₽`
                    });
                } else {
                    if (order && order.orders[0].order_status === 'Выполняется') {
                        return res.status(400).json({
                            message: 'Заказ уже куплен!'
                        })
                    }
                    const request = await driverBuyOrder(order_id, user_id);
                    if (request.error_message === 'Заказ уже куплен') {
                        console.log('hello')
                        return res.status(400).json({
                            message: 'Заказ уже куплен!'
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
            } else
                res.status(300).json({
                    message: 'Заказ уже был куплен/не существует.'
                })
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
                return res.status(400).json({
                    message: "Вы не можете завершить заказ который еще не начался."
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
        const {from, to, tariff, priceFrom, priceTo, dateFrom, dateTo} = req.query;
        const {user_id} = req;
        try {
            const driver = await Drivers.findOne({
                _id: user_id
            });
            const tariffId = driver.tariffId;
            const isNewOrder = (order) => {
                const orderCreateDate = DateTime.fromFormat(order.order_create_date, 'yyyy-MM-dd HH:mm:ss', {zone: 'Europe/Moscow'});
                const nowMoscow = DateTime.local().setZone('Europe/Moscow');
                const minutesDifference = nowMoscow.diff(orderCreateDate).as('minutes');
                return Math.abs(minutesDifference) < 1;
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
                    return Math.round(timeDifferenceInHours) < 2 || JSON.parse(order.isUrgent) === true;
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
            const timeFilterResults = await Promise.all(
                ordersArr.orders.map(async order => await filterOrdersByTime(order))
            );

            function filterOrdersByDriverTariff(order, driverTariff) {
                switch (driverTariff) {
                    case "Стандарт":
                        return order.order_tarif === "Стандарт";
                    case "Комфорт":
                        return order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт";
                    case "Бизнес":
                        return order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт" || order.order_tarif === "Бизнес";
                    case "Минивэн":
                        return order.order_tarif === "Минивэн" || order.order_tarif === "Стандарт" || order.order_tarif === "Комфорт" || order.order_tarif === "Бизнес"
                    default:
                        return false;
                }
            }

            const filteredOrders = await Promise.all(
                ordersArr.orders
                    .filter((order, index) => timeFilterResults[index])
                    .filter(order => !from || order.order_start === from)
                    .filter(order => !to || order.order_end === to)
                    .filter(order => !tariff || order.order_tarif === tariff)
                    .filter(order => filterOrdersByPrice(order))
                    .filter(order => {
                        const orderCreateDate = DateTime.fromFormat(order.order_create_date.split(' ')[0], 'yyyy-MM-dd', {zone: 'Europe/Moscow'});
                        if (dateFrom && !dateTo) {
                            const dateFromDT = DateTime.fromISO(dateFrom, {zone: 'Europe/Moscow'});
                            return orderCreateDate >= dateFromDT.startOf('day');
                        } else if (!dateFrom && dateTo) {
                            const dateToDT = DateTime.fromISO(dateTo, {zone: 'Europe/Moscow'});
                            return orderCreateDate <= dateToDT.endOf('day');
                        } else if (dateFrom && dateTo) {
                            const dateFromDT = DateTime.fromISO(dateFrom, {zone: 'Europe/Moscow'});
                            const dateToDT = DateTime.fromISO(dateTo, {zone: 'Europe/Moscow'});
                            return orderCreateDate >= dateFromDT.startOf('day') && orderCreateDate <= dateToDT.endOf('day');
                        }
                        return true;
                    })
                    .filter(order => filterOrdersByDriverTariff(order, tariffId))
                    .filter(order => isSubbed ? true : isNewOrder(order) === false)
                    .map(async (order) => {
                        const dispatch = await getDispetcherById(order.order_dispatcher);
                        if (dispatch && dispatch.dispetcher) {
                            order.order_dispatcher = {
                                dispatcher_name: dispatch.dispetcher.dispetcher_name,
                                dispatcher_image: dispatch.dispetcher.dispetcher_image,
                                dispatcher_phone: dispatch.dispetcher.dispetcher_phone,
                                dispatcher_email: dispatch.dispetcher.dispetcher_email,
                                dispatcher_telegram: dispatch.dispetcher.dispetcher_telegram,
                            };
                        }
                        return order;
                    })
            );
            console.log(filteredOrders);
            const response = {
                orders: filteredOrders.filter(Boolean) || [],
                count_orders: filteredOrders.filter(Boolean).length,
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
