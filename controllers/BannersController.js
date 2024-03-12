import Banners from "../schemas/BannersSchema";

class BannersController {
    static createBanner = async (req, res, next) => {
        const {img, title, description} = req.body;
        const newBanner = new Banners({
            img,
            title,
            description
        });
        await newBanner.save();
        return res.status(200).json({
            message: 'success'
        })
    }
    //
    static getBanners = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const banners = await Banners.find().skip(skip).limit(limit);
            return res.status(200).json(banners)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static deleteBanner = async (req, res, next) => {
        try {
            const {banner_id} = req.query;
            await Banners.findOneAndDelete({
                _id: banner_id
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static updateBanner = async (req, res, next) => {
        try {
            const {banner_id} = req.query;
            const {img, title, description} = req.body;
            await Banners.updateOne({
                _id: banner_id
            }, {
                img,
                title,
                description
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getSingleBanner = async (req, res, next) => {
        try {
            const {banner_id} = req.query;
            const banner = await Banners.findOne({
                _id: banner_id
            });
            res.status(200).json(banner);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static makeActive = async (req, res, next) => {
        try {
            const {banner_id} = req.query;
            await Banners.updateMany({}, {isActive: false});
            await Banners.updateOne({_id: banner_id}, {isActive: true});
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }

    //
    static getActive = async (req, res, next) => {
        try {
            const banner = await Banners.findOne({
                isActive: true
            });
            res.status(200).json(banner);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}


export default BannersController;
