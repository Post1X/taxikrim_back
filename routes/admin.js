import AdminController from "../controllers/AdminController";

const express = require('express')

const router = express.Router();

router.post('/approve', AdminController.approveDriver);
router.get('/users', AdminController.getVerifying);
router.get('/drivers/all', AdminController.getAllDrivers);
router.put('/drivers/ban', AdminController.banDriver);
router.post('/deny', AdminController.denyDriver);

export default router;
