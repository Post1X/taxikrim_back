import Orders from "../schemas/OrdersSchema";
import io from "socket.io-client";
import cron from "node-cron";
import {getAllOpenOrders} from "../api/getAllOpenOrders";
import admin from "firebase-admin";
import Fcm from "../schemas/FcmSchema";

const urgentOrders = io.connect('http://localhost:3001/order/urgent');

const asyncSearchFunction = async () => {
    try {
        const now = new Date();
        const anotherOrdersResponse = await getAllOpenOrders();

        if (!anotherOrdersResponse || !anotherOrdersResponse.orders || anotherOrdersResponse.orders.length === 0) {
            console.log('Нет новых заказов');
            return 'Нет новых заказов';
        }

        const anotherOrders = anotherOrdersResponse.orders;
        const filteredAnotherOrders = anotherOrders.filter(order => {
            const orderDate = new Date(order.order_date);
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
            return 'Не найдено';
        } else {
            console.log('Найдено');

            const users = await Fcm.find();
            let token_array = [];
            users.map((item) => {
                if (item.is_driver === true)
                    token_array.push(item.token);
            });

            const message = {
                notification: {
                    title: "УСПЕЙ ВЗЯТЬ!",
                    body: "Появились срочные заказы"
                },
                tokens: token_array
            };

            await admin.messaging()
                .sendMulticast(message)
                .catch((error) => {
                    throw error;
                });

            urgentOrders.emit('found', allFilteredOrders);
            return allFilteredOrders;
        }
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        throw error;
    }
};

asyncSearchFunction()
    .then(result => {
        console.log('ok')
    })
    .catch(error => {
        console.error('Ошибка при поиске:', error);
    });

const setupCronTask = () => {
    const cronSchedule = '*/30 * * * * *';
    cron.schedule(cronSchedule, async () => {
        await asyncSearchFunction();
    });
};

export default setupCronTask;
