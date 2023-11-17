import AdminController from "../controllers/AdminController";

const express = require('express')

const router = express.Router();

router.post('/approve', AdminController.approveDriver);
router.post('/deny', AdminController.denyDriver);

export default router;
