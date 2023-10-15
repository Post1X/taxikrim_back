import {searchAddress, searchCity} from "../utilities/getadress";

class CitiesController {
    static GetAddress = async (req, res, next) => {
        try {
            const {city, query} = req.query;
            if (query) {
                const cityResponse = await searchCity(query);
                res.status(200).json(cityResponse)
            }
            if (city) {
                const addressResponse = await searchAddress(`${city}, ${query}`);
                res.status(200).json(addressResponse);
            }
            if(!query && !city) {
                res.status(301).json({
                    error: 'Отправьте что-нибудь'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default CitiesController;
