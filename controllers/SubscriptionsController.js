import Pricelists from "../schemas/PricelistsSchema";
import Subscriptions from "../schemas/SubscribitionsSchema";
import Payments from "../schemas/PaymentsSchema";
import PaymentMethods from "../schemas/PaymentMethodsSchema";
import Drivers from "../schemas/DriversSchema";

class SubscriptionsController {
    static CreateSubscription = async (req, res, next) => {
        try {
            const {type, price} = req.body;
            const newPricelists = new Pricelists({
                type: type,
                price: price,
            });
            await newPricelists.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getSubInfo = async (req, res, next) => {
        try {
            const {role} = req.query;
            let filter;
            if (role.isDispatcher)
            {
                filter = 'dipsatcher'
            }
            if (role.isDriver)
            {
                filter = 'driver'
            }
            if (role.isHybrid)
            {
                filter = 'hybrid';
            }
            const pricelists = await Pricelists.find({
                filter
            });
            res.status(200).json(pricelists);
        }catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static Subscribe = async (req, res, next) => {
        try {
            const {dispatcher, driver} = req.query;
            const {user_id} = req;
            const url = 'https://api.yookassa.ru/v3/payments';
            const payment_method_id = await PaymentMethods.findOne({
                user_id: user_id
            })
            let subDetails;
            if (dispatcher) {
                subDetails = await Pricelists.findOne({
                    type: 'dispatcher'
                })
            }
            if (driver) {
                subDetails = await Pricelists.findOne({
                    type: 'driver'
                })
            }
            const drive = await Pricelists.findOne({
                type: driver
            });
            if (organisation.subscription_status === false) {
                function generateRandomString(length) {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    let randomString = '';

                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * characters.length);
                        randomString += characters.charAt(randomIndex);
                    }
                    return randomString;
                }

                if (payment_method_id) {
                    const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
                    const idempotenceKey = generateRandomString(7);
                    const requestData = {
                        amount: {
                            value: subDetails.price,
                            currency: 'RUB'
                        },
                        capture: true,
                        description: organizationId,
                        payment_method_id: payment_method_id.payment_method_id
                    };
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': authHeader,
                            'Idempotence-Key': idempotenceKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestData)
                    })
                        .then(response => response.json())
                        .then(async data => {
                            try {
                                const newPayment = new Payments({
                                    user_id: user_id,
                                    order_id: data.id,
                                    forSub: true,
                                    forMonth: true,
                                    isDispatch: dispatcher ? true : false
                                });
                                if (dispatcher) {
                                    await Drivers.updateOne({_id: user_id}, {isDispatch: true});
                                }
                                await newPayment.save();
                                const filter = {_id: newPayment.id};
                                await Payments.updateMany({_id: {$ne: filter}}, {
                                    forSub: false,
                                    forMonth: false
                                });
                                res.status(200).json({
                                    message: 'success'
                                })
                            } catch (error) {
                                console.error('Error saving payment:', error);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
                if (!payment_method_id) {
                    const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
                    const idempotenceKey = generateRandomString(7);
                    const requestData = {
                        amount: {
                            value: subDetails.month_amount,
                            currency: 'RUB'
                        },
                        capture: true,
                        confirmation: {
                            type: 'redirect',
                            return_url: 'http://localhost:3001/orders/'
                        },
                        description: organizationId,
                        save_payment_method: true
                    };
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': authHeader,
                            'Idempotence-Key': idempotenceKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestData)
                    })
                        .then(response => response.json())
                        .then(async data => {
                            const newPayment = new Payments({
                                user_id: user_id,
                                order_id: data.id,
                                forSub: true,
                                forMonth: true,
                                isDispatch: dispatcher ? true : false
                            });
                            const newPaymentMethod = new PaymentMethods({
                                payment_method_id: data.id,
                                user_id: user_id
                            })
                            try {
                                if (dispatcher) {
                                    await Drivers.updateOne({_id: user_id}, {isDispatch: true});
                                }
                                    await newPaymentMethod.save();
                                await newPayment.save();
                                const filter = {_id: newPayment.id};
                                await Payments.updateMany({_id: {$ne: filter}}, {
                                    forSub: false
                                });
                                res.status(200).json({
                                    data: data.confirmation.confirmation_url,
                                });
                            } catch (error) {
                                console.error('Error saving payment:', error);
                                res.status(500).json({error: 'Failed to save payment data'});
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default SubscriptionsController;
