const express = require('express')
import upload from "../utilities/multer";
import SubscriptionsController from "../controllers/SubscriptionsController";

const router = express.Router();
const uploadFields = upload.any();

router.post('/create', SubscriptionsController.CreateSubscription);
router.get('/types', SubscriptionsController.getSubInfo);
router.post('/subscribe', SubscriptionsController.Subscribe);



export default router;
