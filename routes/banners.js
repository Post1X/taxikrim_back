const express = require('express')
import BannersController from "../controllers/BannersController";
const router = express.Router();

router.post('/', BannersController.createBanner);
router.get('/all', BannersController.getBanners);
router.get('/single', BannersController.getSingleBanner);
router.put('/', BannersController.updateBanner);
router.delete('/', BannersController.deleteBanner);
export default router;
