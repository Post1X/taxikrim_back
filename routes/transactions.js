import FinanceController from "../controllers/FinanceController";

const express = require('express')

const router = express.Router();

router.get('/', FinanceController.getAllTransactions)

export default router;
