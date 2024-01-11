import Orders from "../schemas/OrdersSchema";

const socketLogic = (server, io) => {
    const createdOrder = io.of('/order/created');
    const statusChanged = io.of('/order/status');
    const urgentOrders = io.of('/order/urgent');
    const test = io.of('/test');

    createdOrder.on('connection', async (socket) => {
        try {
            socket.on('created', async (data) => {
                try {
                    const {order_id} = data;
                    const order = await Orders.findOne({
                        id: order_id
                    });
                    socket.broadcast.emit('send', {order});
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
                const {order_id} = data;
                const order = await Orders.findOne({
                    _id: order_id
                });
                statusChanged.emit('send', {order});
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
