import OrderStatuses from "../schemas/OrderStatusesSchema";
import Orders from "../schemas/OrdersSchema";
import TariffPrices from "../schemas/TariffPrices";

class OrdersControllers {
    static PlaceOrder = async (req, res, next) => {
        try {
            const {
                from,
                to,
                fulladressend,
                fulladressstart,
                date,
                time,
                tariffId,
                paymentMethod,
                countPeople,
                isBagage,
                isBaby,
                isBuster,
                isAnimal,
                comment
            } = req.body;
            const {user_id} = req;
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
            const newOrder = new Orders({
                destination_start: from,
                destination_end: to,
                full_address_end: fulladressend,
                full_address_start: fulladressstart,
                date: date,
                time: time,
                car_type: tariffId,
                paymentMethod: paymentMethod,
                client: user_id,
                comission: comission,
                baggage_count: isBagage,
                body_count: countPeople,
                animals: isAnimal,
                booster: isBuster,
                kid: isBaby,
                comment: comment,
                dispatcher: user_id,
                status: status
            })
            await newOrder.save();
            res.status(200).json({
                price: price,
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrder = async (req, res, next) => {
        try {
            const {orderId} = req.query;
            const order = await Orders.findOne({
                _id: orderId
            });
            const resData = {
                destination_start: 'Starting Point A',
                destination_end: 'Destination Point X',
                full_address_start: '123 Main Street, City A',
                full_address_end: '456 Elm Street, City X',
                date: new Date('2023-12-01T08:00:00Z'),
                time: '10:30 AM',
                car_type: 'Luxury',
                baggage_count: 2,
                body_count: 3,
                animals: true,
                booster: false,
                kid: true,
                comment: 'Special instructions for the driver',
                total_price: 75.5,
                commission: 10.25,
                driver: '60d5ebf7e9c7f96d6a0f8ea1',
                paymentMethod: 'Credit Card',
                dispatcher: '60d5ebf7e9c7f96d6a0f8ea2',
                status: '60d5ebf7e9c7f96d6a0f8ea3'
            }
            res.status(200).json(order ? order : resData)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrders = async (req, res, next) => {
        try {
            // const {user_id} = req;
            const orders = await Orders.find({});
            const mockOrdersData = [
                {
                    destination_start: 'Starting Point A',
                    destination_end: 'Destination Point X',
                    full_address_start: '123 Main Street, City A',
                    full_address_end: '456 Elm Street, City X',
                    date: new Date('2023-12-01T08:00:00Z'),
                    time: '10:30 AM',
                    car_type: 'Luxury',
                    baggage_count: 2,
                    body_count: 3,
                    animals: true,
                    booster: false,
                    kid: true,
                    comment: 'Special instructions for the driver',
                    total_price: 75.5,
                    commission: 10.25,
                    driver: '60d5ebf7e9c7f96d6a0f8ea1',
                    paymentMethod: 'Credit Card',
                    dispatcher: '60d5ebf7e9c7f96d6a0f8ea2',
                    status: '60d5ebf7e9c7f96d6a0f8ea3'
                },
                {
                    destination_start: 'Starting Point B',
                    destination_end: 'Destination Point Y',
                    full_address_start: '789 Oak Street, City B',
                    full_address_end: '012 Pine Street, City Y',
                    date: new Date('2023-11-15T09:30:00Z'),
                    time: '12:45 PM',
                    car_type: 'Standard',
                    baggage_count: 1,
                    body_count: 2,
                    animals: false,
                    booster: true,
                    kid: false,
                    comment: 'No additional instructions',
                    total_price: 50.25,
                    commission: 8.75,
                    driver: '60d5ebf7e9c7f96d6a0f8ea4',
                    paymentMethod: 'Cash',
                    dispatcher: '60d5ebf7e9c7f96d6a0f8ea5',
                    status: '60d5ebf7e9c7f96d6a0f8ea6'
                }
            ];
            res.status(200).json(orders ? orders : mockOrdersData)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrdersForDriver = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await Orders.find({
                driver: user_id
            });
            const mockOrdersData = {
                destination_start: 'Starting Point A',
                destination_end: 'Destination Point X',
                full_address_start: '123 Main Street, City A',
                full_address_end: '456 Elm Street, City X',
                date: new Date('2023-12-01T08:00:00Z'),
                time: '10:30 AM',
                car_type: 'Luxury',
                baggage_count: 2,
                body_count: 3,
                animals: true,
                booster: false,
                kid: true,
                comment: 'Special instructions for the driver',
                total_price: 75.5,
                commission: 10.25,
                driver: '60d5ebf7e9c7f96d6a0f8ea1',
                paymentMethod: 'Credit Card',
                dispatcher: '60d5ebf7e9c7f96d6a0f8ea2',
                status: '60d5ebf7e9c7f96d6a0f8ea3'
            };
            res.status(200).json(orders ? orders : mockOrdersData);
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
    //
    static createTariff = async (req, res, next) => {
        try {
            const {type, price, km} = req.body;
            const newTariff = new TariffPrices({
                type: type,
                price: price,
                km: !!km
            });
            await newTariff.save();
            res.status(200).json({
                message: true
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersControllers;
