import DriversController from "../controllers/DriversController";
import upload from "../utilities/multer";
import OrdersControllers from "../controllers/OrdersControllers";
import {getOrderByDriver} from "../api/getOrderByDriver";
import {getAllOpenOrders} from "../api/getAllOpenOrders";

const express = require('express')

const router = express.Router();
const uploadFields = upload.any();

router.post('/create', OrdersControllers.PlaceOrder);
router.post('/created', OrdersControllers.createdOrder);
router.get('/single', OrdersControllers.getOrder);
router.post('/close', OrdersControllers.closeOrder);
router.get('/test', async (req, res, next) => {
    const orders = await getAllOpenOrders();
    res.status(200).json(orders);
});
router.post('/buy', OrdersControllers.buyOrder);
router.get('/all', OrdersControllers.getOrders);
router.get('/archive', OrdersControllers.getArchive);
router.get('/driver', OrdersControllers.getOrdersForDriver);
router.get('/cars', DriversController.getCars);
router.get('/urgent', OrdersControllers.getUrgentOrders);

export default router;
