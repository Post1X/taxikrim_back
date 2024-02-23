import MessagingController from "../controllers/MessagingController";
const express = require('express')

const router = express.Router();

router.post('/', MessagingController.sendMessage);
router.post('/gen-token', MessagingController.generateTokenForUser);
router.post('/untie-token', MessagingController.untieFcm);
router.post('/delete-token', MessagingController.deleteFcm);
router.post('/change-status', MessagingController.generateTokenForUser);

export default router;
