import AdminController from "../controllers/AdminController";

const express = require('express')

const router = express.Router();

router.post('/approve', AdminController.approveDriver);
router.get('/users', AdminController.getVerifying);
router.get('/drivers/deleted', AdminController.getDeletedDrivers)
router.post('/balance', AdminController.changeBalance);
router.post('/message', AdminController.sendMessageToToken);
router.get('/drivers/all', AdminController.getAllDrivers);
router.put('/drivers/ban', AdminController.banDriver);
router.post('/deny', AdminController.denyDriver);

export default router;
