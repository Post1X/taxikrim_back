import OrderStatuses from "../schemas/OrderStatusesSchema";
import Orders from "../schemas/OrdersSchema";
import OrdersSchema from "../schemas/OrdersSchema";

class OrdersControllers {
    static PlaceOrder = async (req, res, next) => {
        try {
            const {
                from,
                to,
                tariffId,
                paymentMethod,
                countPeople,
                isBagage,
                isBaby,
                isBuster,
                isAnimal,
                comment
            } = req.body;
            const  {user_id} = req;
            const comission = 30;
            const distance_price = 5000;
            const status = '64e783585c0ccd9eb28373d4';
            let price = distance_price;
            if (countPeople <= 5) {
                price += 1500;
            }
            if (countPeople > 5) {
                price += 2500;
            }
            if (isBagage <= 5) {
                price += 200;
            }
            if (isBagage > 5) {
                price += 500;
            }
            if (isBaby) {
                price += 500;
            }
            if (isBuster) {
                price += 300;
            }
            if (isAnimal) {
                price += 400;
            }
            const checkUps = {
                isBaby: !!isBaby,
                isBuster: !!isBuster,
                isAnimal: !!isAnimal
            }
            const comissionPrice = (comission / 100) * price;
            const newOrder = new Orders({
                destination_start: from,
                destination_end: to,
                date: `${from.date}, ${from.time}`,
                car_type: tariffId,
                paymentMethod: paymentMethod,
                client: user_id,
                comission: comissionPrice,
                baggage_count: isBagage,
                body_count: countPeople,
                checkups: checkUps,
                status: status
            })
            res.status(200).json({
                price: price,
                aaa: 'dwada'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static asasa = async (req, res, next) => {
        const {title} = req.query;
        const newStatus = new OrderStatuses({
            title: title
        })
        await newStatus.save();
    }
}

export default OrdersControllers;
