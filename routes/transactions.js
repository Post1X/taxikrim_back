import FinanceController from "../controllers/FinanceController";

const express = require('express')

const router = express.Router();

router.post('/', FinanceController.getAllTransactions)

export default router;
