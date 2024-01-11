import users from "./users";
import subscription from "./subscription";
import order from "./order";
import adddata from "./adddata";
import admin from "./admin";
import message from "./message";
import banners from "./banners";
import financial from "./financial";

import authorization from "../middlewares/validation";
import sub from "../middlewares/sub";

const express = require('express');

const router = express.Router();

router.use('/users', authorization, sub, users)
router.use('/message', sub, message)
router.use('/subscription', sub, authorization, subscription);
router.use('/banners', authorization, banners);
router.use('/order', authorization, sub,order);
router.use('/add-data', sub, adddata);
router.use('/root', authorization, admin);
router.use('/financial', authorization, sub, financial);

export default router;
