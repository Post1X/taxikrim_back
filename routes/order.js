const express = require('express')
import upload from "../utilities/multer";
import OrdersControllers from "../controllers/OrdersControllers";

const router = express.Router();
const uploadFields = upload.any();

router.post('/create', OrdersControllers.PlaceOrder);
// router.post('/status', OrdersControllers.asasa);

export default router;
