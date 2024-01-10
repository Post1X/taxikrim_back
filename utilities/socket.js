import Orders from "../schemas/OrdersSchema";

const socketLogic = (server, io) => {
    const createdOrder = io.of('/order/created');
    const getOrder = io.of('/orders/created/get');
    const statusChanged = io.of('/order/status');

    createdOrder.on('connection', async (socket) => {
        try {
            socket.on('created', async (data) => {
                console.log('anus');
                const { order_id } = data;
                const order = await Orders.findOne({
                    _id: order_id
                });
                socket.broadcast.emit('send', { order });
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e);
        }
    });

    getOrder.on('connection', async (socket) => {
        try {
            console.log('Connected to getOrder namespace');
            socket.on('send', async (data) => {
                console.log("pidor");
                console.log(data);
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e)
        }
    });

    statusChanged.on('connection', async (socket) => {
        try {
            socket.on('changed', async (data) => {
                const { order_id } = data;
                const order = await Orders.findOne({
                    _id: order_id
                });
                statusChanged.emit('send', { order });
            });
        } catch (e) {
            console.error("Ошибка в сокете:", e);
        }
    });
};

export default socketLogic;
