import {getOrderById} from "../api/getOrderById";
import {getDispetcherById} from "../api/getDispetcherById";

const time = process.env.DELAY_TIME;
const socketLogic = (server, io) => {
    const createdOrder = io.of('/order/created');
    const statusChanged = io.of('/order/status');
    const urgentOrders = io.of('/order/urgent');
    //
    createdOrder.on('connection', async (socket) => {
        try {
            socket.on('created', async (data) => {
                try {
                    const response = await getOrderById(data);
                    socket.broadcast.emit('send-vip', response.orders[0]);
                    console.log('send-vip')
                    setTimeout(async () => {
                        console.log('send')
                        const responseToCheck = await getOrderById(data);
                        if (responseToCheck.orders[0].order_status === 'На продаже')
                            socket.broadcast.emit('send', response.orders[0]);
                        else
                            console.log('Hello world')
                    }, (60) * 1000);
                } catch (e) {
                    console.error("Ошибка в сокете:", e);
                }
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e);
        }
    });
    statusChanged.on('connection', async (socket) => {
        try {
            socket.on('changed', async (data) => {
                statusChanged.emit('send', data, {
                    isUrgent: true
                });
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e);
        }
    });
    urgentOrders.on('connection', (socket) => {
        socket.on('found', async (data) => {
            let bigArr = [];
            socket.broadcast.emit('send-vip', {data});
            setTimeout(async () => {
                await Promise.all(data.map(async (item) => {
                    const order = await getOrderById(item.order_id);
                    if (order.orders[0].order_status === 'На продаже') {
                        const orderWithDispatcher = {...order.orders[0]};
                        const dispatcher = await getDispetcherById(order.orders[0].order_dispatcher);
                        orderWithDispatcher.order_dispatcher = dispatcher.dispetcher;
                        bigArr.push(orderWithDispatcher);
                    }
                }));
                socket.broadcast.emit('send', {bigArr});
            }, (time * 60) * 1000);
        });
    });
};

export default socketLogic;
