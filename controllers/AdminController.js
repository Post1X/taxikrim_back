import Drivers from "../schemas/DriversSchema";

class AdminController {
    static approveDriver = async (req, res, next) => {
        try {
            const {driverId} = req.query;
            await Drivers.updateOne({
                _id: driverId
            }, {
                regComplete: 'complete'
            })
            res.status(200).json({
                message: 'success'
            })
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static denyDriver = async (req, res, next) => {
        try {
            const {driverId} = req.query;
            await Drivers.updateOne({
                _id: driverId
            }, {
                regComplete: 'rejected'
            })
            res.status(200).json({
                message: 'success'
            })
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default AdminController;
