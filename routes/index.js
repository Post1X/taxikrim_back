import users from "./users";

import authorization from "../middlewares/validation";

const express = require('express');

const router = express.Router();

router.use('/users', authorization, users)

export default router;
