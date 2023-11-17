import Pricelists from "../schemas/PricelistsSchema";
import Payments from "../schemas/PaymentsSchema";
import PaymentMethods from "../schemas/PaymentMethodsSchema";
import Drivers from "../schemas/DriversSchema";

class SubscriptionsController {
    static CreateSubscription = async (req, res, next) => {
        try {
            const {type, price, description} = req.body;
            const newPricelists = new Pricelists({
                type: type,
                price: price,
                description: description
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
            let filter = {};
            filter.type = role;
            const pricelists = await Pricelists.find(filter);
            res.status(200).json(pricelists);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static Subscribe = async (req, res, next) => {
        try {
            const {user_id} = req;
            const organisation = await Drivers.findOne({
                _id: user_id
            })
            const url = 'https://api.yookassa.ru/v3/payments';
            const subDetails = await Pricelists.findOne({
                type: 'driver'
            });
            console.log(organisation);
            console.log(subDetails.price.toString());
            if (organisation.subscription_status === true) {
                res.status(301).json({
                    error: 'У вас уже есть подписка'
                })
            }
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

                const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
                const idempotenceKey = generateRandomString(7);
                const requestData = {
                    amount: {
                        value: subDetails.price,
                        currency: 'RUB'
                    },
                    description: 'Тестик',
                    confirmation: {
                        type: 'redirect',
                        return_url: 'http://localhost:3001/orders/sas'
                    },
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
                        try {
                            if (!data.error) {
                                console.log(data);
                                await PaymentMethods.updateMany({
                                    user_id: user_id
                                }, {
                                    isNew: false
                                })
                                const newPaymentMethod = new PaymentMethods({
                                    user_id: user_id,
                                    payment_method_id: data.id,
                                    isNew: true
                                })
                                console.log(data)
                                await newPaymentMethod.save();
                                res.status(200).json({
                                    data: data.confirmation.confirmation_url
                                    // message: 'hi'
                                })
                            } else {
                                res.status(400).json({
                                    message: 'Ошибка. Попробуйте снова.'
                                })
                            }
                        } catch (error) {
                            console.error('Error saving payment:', error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static  changeStatus = async (req, res, next) => {
        try {
            const {type} = req.query;
            const {user_id} = req;
            const payment = await PaymentMethods.findOne({
                user_id: user_id,
                isNew: true
            });
            const user = await Drivers.findOne({
                _id: user_id
            })
            // if (payment) {
                await Payments.updateMany({
                    seller_id: user_id,
                    isNew: false
                })
                const newPayment = new Payments({
                    seller_id: user_id,
                    // payment_method_id: payment.payment_method_id,
                    type: type,
                    isNew: true
                })
                console.log('anus1')
                const currentDate = new Date();
                const futureDate = new Date(currentDate);
                futureDate.setMonth(currentDate.getMonth() + 1);
                const isoFormat = futureDate.toISOString();
                if (user.regComplete !== 'complete' && user.regComplete !== 'rejected') {
                    await Drivers.findOneAndUpdate({
                        _id: user_id
                    }, {
                        subscription_status: true,
                        subscription_until: isoFormat,
                        is_active: true,
                        regComplete: 'subscribed'
                    });
                } if (user.regComplete === 'complete' && user.regComplete === 'rejected') {
                    console.log('anus3')
                    await Drivers.findOneAndUpdate({
                        _id: user_id
                    }, {
                        subscription_status: true,
                        subscription_until: isoFormat,
                        is_active: true,
                    });
                }
                console.log('anus1')
                await newPayment.save()
                res.status(200).json({
                    message: 'success'
                })
            // }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
}

export default SubscriptionsController;
