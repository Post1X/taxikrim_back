import MessagingController from "../controllers/MessagingController";
const express = require('express')

const router = express.Router();

router.post('/', MessagingController.sendMessage);
router.post('/gen-token', MessagingController.generateTokenForUser);

export default router;
