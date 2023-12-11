import findCity from "../utilities/getadress";

class CitiesController {
    static GetAddress = async (req, res, next) => {
        try {
            const {city} = req.query;
            const response = await findCity(city);
            const cities = response.map((item, index) => ({
                id: index + 1,
                city: `${item.title.text}${item.subtitle && item.subtitle.text ? `, ${item.subtitle.text}` : ''}`
            }));
            res.status(200).json(cities);
        } catch (e) {
            e.status = e.status || 500;
            next(e);
        }
    }
}

export default CitiesController;
