import AddDataController from "../controllers/AddDataController";
import DriversController from "../controllers/DriversController";

const express = require('express')

const router = express.Router();

router.post('/tariff', AddDataController.addTariff);
router.post('/model', AddDataController.addCarModel);
router.post('/model', AddDataController.getCarModel);
router.get('/tariff', AddDataController.getTariff);
router.post('/brand', DriversController.createBrand);

export default router;
