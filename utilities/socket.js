import {getOrderById} from "../api/getOrderById";

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
                    socket.broadcast.emit('send', response.orders[0]);
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
                statusChanged.emit('send', data);
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e);
        }
    });
    urgentOrders.on('connection', (socket) => {
        console.log('подключен');
        socket.on('found', (data) => {
            socket.broadcast.emit('send', {data});
        });
    });
};

export default socketLogic;
