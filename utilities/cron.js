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
                { zone: 'Europe/Moscow' }
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
                    console.error('Ошибка при отправке уведомления:', error);
                    throw error;
                });

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
