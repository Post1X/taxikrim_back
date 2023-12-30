import DriversController from "../controllers/DriversController";

const express = require('express')
import upload from "../utilities/multer";
import OrdersControllers from "../controllers/OrdersControllers";

const router = express.Router();
const uploadFields = upload.any();

router.post('/create', OrdersControllers.PlaceOrder);
router.get('/single', OrdersControllers.getOrder);
router.post('/close', OrdersControllers.closeOrder);
router.post('/buy', OrdersControllers.buyOrder);
router.get('/all', OrdersControllers.getOrders);
router.get('/driver', OrdersControllers.getOrdersForDriver);

export default router;
