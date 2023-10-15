import DriversController from "../controllers/DriversController";

const express = require('express')
import upload from "../utilities/multer";
import ClientsController from "../controllers/ClientsController";

const router = express.Router();
const uploadFields = upload.any();

// clients
router.post('/clients/make-call', ClientsController.RegisterNumber);
router.post('/clients/register', ClientsController.RegisterBuyer);
router.put('/clients/update', uploadFields, ClientsController.UpdateData);

// drivers
router.post('/drivers/make-call', DriversController.makeCall);
router.post('/upload', DriversController.uploadImage);
router.post('/drivers/verify', DriversController.registerDriver);
router.put('/drivers/add-data', DriversController.updateDriver);

// dispatchers


export default router;
