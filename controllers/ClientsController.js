import Clients from "../schemas/ClientsSchema";
class ClientsController {
    static RegisterNumber = async (req, res, next) => {
        try {
            const {phone_number} = req.body;
            
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
}
