import DriversController from "../controllers/DriversController";
import upload from "../utilities/multer";
import ClientsController from "../controllers/ClientsController";
import OrdersControllers from "../controllers/OrdersControllers";

const express = require('express')

const router = express.Router();
const uploadFields = upload.any();

// clients
router.post('/clients/make-call', ClientsController.RegisterNumber);
router.post('/clients/register', ClientsController.RegisterBuyer);
router.put('/clients/update', uploadFields, ClientsController.UpdateData);
router.get('/clients/info', ClientsController.getInfo);
//
router.post('/dispatch/data', DriversController.getDispatch);
// drivers
router.post('/drivers/make-call', DriversController.makeCall);
router.get('/driver/logged', DriversController.isDriverLogged);
router.delete('/driver/acc', DriversController.deleteAccount);
router.post('/driver', DriversController.deleteDriverAccById);
router.put('/drivers/token', DriversController.updateToken);
router.post('/upload', uploadFields, DriversController.uploadImage);
router.get('/drivers/info', DriversController.getData);
router.post('/drivers/verify', DriversController.registerDriver);
router.put('/drivers/add-data', DriversController.updateDriver);
router.put('/drivers/add-data/logged', DriversController.updateDriverLogged);
router.post('/tariff', OrdersControllers.createTariff);

// dispatchers


export default router;
