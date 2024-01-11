import Subscriptions from "../schemas/SubscribitionsSchema";

const {TERMINAL_KEY, PAYMENT_URL} = process.env;

const generateUniqueNumbers = () => {
    let result = '';
    while (result.length < 36) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

let cachedOrderId = generateUniqueNumbers(); // Генерируем OrderId заранее
export async function getPaymentUrl(price) {
    console.log(cachedOrderId);
    console.log(TERMINAL_KEY)
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: price * 100,
            OrderId: generateUniqueNumbers(),
            Description: "Пополнение баланса на сервисе ВСЕ-Заказы.ру",
            Token: "68711168852240a2f34b6a8b19d2cfbd296c7d2a6dff8b23eda6278985959346",
            SuccessURL: "ygdriver://balance-payment-success",
            FailURL: "ygdriver://balance-payment-failed",
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(PAYMENT_URL, requestData);
        console.log(response);
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}


export async function getSubscribeUrl() {
    const pricelist = await Subscriptions.findOne();
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: pricelist.driver_price * 100,
            OrderId: generateUniqueNumbers(),
            Description: "Подписка на услуги ВСЕ-ЗАКАЗЫ.ру",
            Token: "68711168852240a2f34b6a8b19d2cfbd296c7d2a6dff8b23eda6278985959346",
            SuccessURL: "ygdriver://access-success-payment",
            FailURL: "ygdriver://access-failed-payment"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(PAYMENT_URL, requestData);
        console.log(response);
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}

export async function getSubscribeToUrgentUrl() {
    const pricelist = await Subscriptions.findOne();
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: pricelist.urgent_price * 100,
            OrderId: generateUniqueNumbers(),
            Description: "Подписка на услуги ВСЕ-ЗАКАЗЫ.ру",
            Token: "68711168852240a2f34b6a8b19d2cfbd296c7d2a6dff8b23eda6278985959346",
            SuccessURL: "ygdriver://urgent-order-payment-success",
            FailURL: "ygdriver://urgent-order-payment-failed"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(PAYMENT_URL, requestData);
        console.log(response);
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}
