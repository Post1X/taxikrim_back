import Payments from "../schemas/PaymentsSchema";
import CheckPayment from "../utilities/CheckPayment";
import PaymentMethods from "../schemas/PaymentMethodsSchema";
import generateRandomString from "../utilities/randomStringGenerator";
import Subscriptions from "../schemas/SubscribitionsSchema";
import fetch from 'node-fetch';
import Organisations from "../schemas/OrganisationsSchema";
import Drivers from "../schemas/DriversSchema";
import order from "../routes/order";

const subscription = async (req, res, next) => {
    try {
        const {user_id, isDriver} = req;
        const driver = await Drivers.findOne({
            _id: user_id,
            isDispatch: true
        });
        let isDisp;
        if (driver.isDispatch === true)
        {
            isDisp = true;
        }
        let subDetails;
        if (isDisp) {
            subDetails = await Subscriptions.findOne({
                type: 'dispatcher'
            })
        }
        if (ifDisp === false) {
            subDetails = await Subscriptions.findOne({
                type: 'driver'
            })
        }
        const url = 'https://api.yookassa.ru/v3/payments';
        if (isDriver) {
            const paymentMethod = await PaymentMethods.findOne({user_id});
            const orderForMonth = await Payments.findOne({seller_id: user_id, isNew: true, forMonth: true});
            if (!orderForMonth) {
                return next();
            }
            if (orderForMonth) {
                await Payments.findOneAndUpdate({seller_id: user_id}, {isNew: false, forMonth: false});
                const paymentStatus = await CheckPayment(orderForMonth.order_id);
                if (paymentStatus.paid !== true) {
                    return next();
                }
                if (paymentStatus.paid === true) {
                    if (paymentMethod) {
                        await Organisations.findOneAndUpdate({
                            _id: paymentStatus.description
                        }, {
                            subscription_until: new Date(paymentStatus.captured_at)
                        })
                        const organisation = await Organisations.findOne({
                            _id: paymentStatus.description
                        })
                        const start = new Date(organisation.subscription_until);
                        const dayOfStart = `${start.getDate()}/${start.getMonth()}`;
                        const dayOfNewDate = `${new Date().getDate()}/${new Date().getMonth()}`;
                        if (dayOfStart === dayOfNewDate) {
                            const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
                            const idempotenceKey = generateRandomString(7);
                            const requestData = {
                                amount: {
                                    value: subDetails.price,
                                    currency: 'RUB'
                                },
                                capture: true,
                                description: organisation._id,
                                payment_method_id: paymentMethod.payment_method_id
                            };
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Authorization': authHeader,
                                    'Idempotence-Key': idempotenceKey,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(requestData)
                            });
                            if (response.status !== 200) {
                                console.error(response.status)
                                return next();
                            }
                            const data = await response.json();
                            const newPayment = new Payments({
                                seller_id: user_id,
                                order_id: data.id,
                                forSub: true,
                                forYear: true,
                            });
                            await newPayment.save();
                            const currentDate = new Date(paymentStatus.captured_at);
                            const nextDate = new Date(currentDate);
                            nextDate.setMonth(currentDate.getMonth() + 1);
                            await Drivers.findOneAndUpdate({_id: user_id}, {
                                subscription_status: true,
                                subscription_until: nextDate
                            });
                            return next();
                        }
                    }
                }
                next();
            }
        } else {
            return next();
        }
    } catch (e) {
        e.status = 401;
        next(e);
    }
};

export default subscription;
