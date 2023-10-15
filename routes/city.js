const express = require('express')
import upload from "../utilities/multer";
import CitiesController from "../controllers/CitiesController";

const router = express.Router();
const uploadFields = upload.any();

router.get('/', CitiesController.GetAddress);

export default router;
