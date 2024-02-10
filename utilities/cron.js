import io from "socket.io-client";
import cron from "node-cron";
import {getAllOpenOrders} from "../api/getAllOpenOrders";
import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";
import {DateTime} from "luxon";
import {getDispetcherById} from "../api/getDispetcherById";

const urgentOrders = io.connect('http://localhost:3001/order/urgent');

const asyncSearchFunction = async () => {
    try {
        const nowMoscow = DateTime.local().setZone('Europe/Moscow');
        const ordersArr = await getAllOpenOrders();
        if (!ordersArr || !ordersArr.orders || !Array.isArray(ordersArr.orders)) {
            console.log('Не найдено');
            return 'Не найдено';
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
                return timeDifferenceInHours <= 2;
            }
            return false;
        };
        const filteredOrders = await Promise.all(ordersArr.orders
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
            }));

        if (filteredOrders.length === 0) {
            console.log('Не найдено');
            return 'Не найдено';
        } else {
            console.log('Найдено');
            const users = await Fcm.find();
            let urgentTokenSet = new Set();
            let regularTokenSet = new Set();
            users.forEach((item) => {
                if (item.is_driver === true) {
                    if (item.urgent === true) {
                        if (item.notification === true)
                            urgentTokenSet.add(item.token);
                    } else {
                        if (item.notification === true)
                            regularTokenSet.add(item.token);
                    }
                }
            });
            const urgentTokens = Array.from(urgentTokenSet);
            const regularTokens = Array.from(regularTokenSet);
            const sendUrgentNotification = async () => {
                const urgentMessage = {
                    notification: {
                        title: "УСПЕЙ ВЗЯТЬ!",
                        body: "Появились срочные заказы",
                        sound: "default"
                    },
                    tokens: urgentTokens
                };
                try {
                    await admin.messaging().sendMulticast(urgentMessage);
                } catch (error) {
                    console.error('Ошибка при отправке уведомления:', error);
                    throw error;
                }
            };

            const sendRegularNotification = async () => {
                const regularMessage = {
                    notification: {
                        title: "Новые заказы",
                        body: "Появились новые заказы",
                        sound: "default"
                    },
                    tokens: regularTokens
                };
                try {
                    await admin.messaging().sendMulticast(regularMessage);
                } catch (error) {
                    console.error('Ошибка при отправке уведомления:', error);
                    throw error;
                }
            };
            if (urgentTokens.length > 0)
                await sendUrgentNotification();
            if (regularTokens.length > 0) {
                setTimeout(async () => {
                    await sendRegularNotification();
                }, 2 * 60 * 1000);
            }
            urgentOrders.emit('found', filteredOrders);
            return filteredOrders;

        }
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        throw error;
    }
};

asyncSearchFunction()
    .then(() => {
        console.log('ok')
    })
    .catch(error => {
        console.error('Ошибка при поиске:', error);
    });

const setupCronTask = () => {
    const cronSchedule = '*/15 * * * *';
    cron.schedule(cronSchedule, async () => {
        await asyncSearchFunction();
    });
};

export default setupCronTask;
