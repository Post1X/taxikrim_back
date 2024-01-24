import users from "./users";
import subscription from "./subscription";
import order from "./order";
import adddata from "./adddata";
import admin from "./admin";
import message from "./message";
import banners from "./banners";
import financial from "./financial";

import authorization from "../middlewares/validation";

const express = require('express');

const router = express.Router();

router.use('/users', authorization, users)
router.use('/message', message)
router.use('/subscription', authorization, subscription);
router.use('/banners', authorization, banners);
router.use('/order', authorization, order);
router.use('/add-data', adddata);
router.use('/root', authorization, admin);
router.use('/financial', authorization, financial);

export default router;
