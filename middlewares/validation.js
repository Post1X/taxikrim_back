import jwt from 'jsonwebtoken';
//
const EXCLUDE = ['/register/client', '/login/client', '/register/dispatcher', '/login/dispatcher','/register/driver', '/login/driver', '/login/admin', '/drivers/make-call', '/drivers/verify']

const authorization = async (req, res, next) => {
    try {
        const {authorization = ''} = req.headers;
        const {originalUrl, method} = req;
        if (method === 'OPTIONS' || EXCLUDE.includes(req.path)) {
            next();
            return;
        }
        if (!authorization) {
            console.log(req.path)
            res.status(400).json({
                error: 'no_token',
                description: 'Непредвиденная ошибка. Свяжитесь с администрацией.'
            })
        }
        const {JWT_SECRET} = process.env;
        const token = authorization.replace('Bearer ', '');
        const userInfo = jwt.verify(token, JWT_SECRET);
        req.user_id = userInfo.user_id;
        if (userInfo.isAdmin) {
            req.isAdmin = userInfo.isAdmin
        }
        if (userInfo.isDriver) {
            req.isDriver = userInfo.isDriver
        }
        if (userInfo.isDispatcher) {
            req.isDispatcher = userInfo.isDispatcher
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

