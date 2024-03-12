import FinanceController from "../controllers/FinanceController";

const express = require('express')

const router = express.Router();

router.get('/balance', FinanceController.getBalance);
router.post('/order', FinanceController.buyOrder);
router.post('/status', FinanceController.checkStatus);
router.post('/balance_t', FinanceController.replenishBalanceTinkoff);
router.post('/balance_b', FinanceController.replenishBalanceBase);

export default router;
