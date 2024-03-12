import Subscriptions from "../schemas/SubscribitionsSchema";
import Payments from "../schemas/PaymentsSchema";
import {createHash} from "crypto";

const {TERMINAL_KEY, PAYMENT_URL, PAYCHECK_URL, PASSWORD} = process.env;

const generateUniqueNumbers = () => {
    let result = '';
    while (result.length < 6) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

export async function getPaymentUrl(price, user_id) {
    const orderId = generateUniqueNumbers();
    const tokenArray = [{"SuccessURL": "ygdriver://balance-payment-success"}, {"FailURL": "ygdriver://balance-payment-failed"}, {"TerminalKey": TERMINAL_KEY}, {"Amount": price * 100}, {"OrderId": orderId}, {"Password": PASSWORD}]
    const sortedTokenArray = tokenArray.sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
    });
    console.log(sortedTokenArray, '<- Отсортированные данные') // <- Отсортированные данные
    let allValues = "";
    for (const obj of sortedTokenArray) {
        for (const key in obj) {
            allValues += obj[key];
        }
    }
    console.log(allValues, '<- Все value без ключей') // <- Все value без ключей
    const hash = createHash("sha256");
    hash.update(allValues);
    console.log(hash)
    const hexDigest = hash.digest("hex");
    console.log(hexDigest, '<- Сам шифр') // <- Сам шифр
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: price * 100,
            OrderId: orderId,
            Token: hexDigest,
            SuccessURL: "ygdriver://balance-payment-success",
            FailURL: "ygdriver://balance-payment-failed",
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(PAYMENT_URL, requestData);
        await Payments.deleteMany({
            driver_id: user_id,
            type: 'balance'
        });
        const newSchema = new Payments({
            driver_id: user_id,
            type: 'balance',
            order_id: orderId,
            amount: price,
            isNew: true
        });
        await newSchema.save();
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}


export async function checkStatus(orderId) {
    const tokenArray = [{"TerminalKey": TERMINAL_KEY}, {"OrderId": orderId}, {"Password": PASSWORD}]
    const sortedTokenArray = tokenArray.sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
    });
    console.log(sortedTokenArray)
    let allValues = "";
    for (const obj of sortedTokenArray) {
        for (const key in obj) {
            allValues += obj[key];
        }
    }
    console.log(allValues)
    const hash = createHash("sha256");
    hash.update(allValues);
    const hexDigest = hash.digest("hex");
    console.log(hexDigest)
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            OrderId: orderId,
            Token: hexDigest,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(PAYCHECK_URL, requestData);
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}


export async function getSubscribeUrl(user_id) {
    const pricelist = await Subscriptions.findOne();
    const orderId = generateUniqueNumbers();
    const tokenArray = [{"TerminalKey": TERMINAL_KEY}, {"Amount": pricelist.driver_price * 100}, {"OrderId": orderId}, {"Password": PASSWORD}]
    const sortedTokenArray = tokenArray.sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
    });
    let allValues = "";
    for (const obj of sortedTokenArray) {
        for (const key in obj) {
            allValues += obj[key];
        }
    }
    const hash = createHash("sha256");
    hash.update(allValues);
    const hexDigest = hash.digest("hex");
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: pricelist.driver_price * 100,
            OrderId: generateUniqueNumbers(),
            Token: hexDigest,
            SuccessURL: "ygdriver://access-success-payment",
            FailURL: "ygdriver://access-failed-payment"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    await Payments.deleteMany({
        driver_id: user_id,
        type: 'subscribe'
    });
    const newSchema = new Payments({
        driver_id: user_id,
        order_id: orderId,
        type: 'subscribe',
        isNew: true
    });
    await newSchema.save();
    try {
        await newSchema.save();
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}

export async function getSubscribeToUrgentUrl(user_id) {
    const pricelist = await Subscriptions.findOne();
    const orderId = generateUniqueNumbers();
    const tokenArray = [{"TerminalKey": TERMINAL_KEY}, {"Amount": pricelist.urgent_price * 100}, {"OrderId": orderId}, {"Password": PASSWORD}]
    const sortedTokenArray = tokenArray.sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
    });
    let allValues = "";
    for (const obj of sortedTokenArray) {
        for (const key in obj) {
            allValues += obj[key];
        }
    }
    const hash = createHash("sha256");
    hash.update(allValues);
    const hexDigest = hash.digest("hex");
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: pricelist.urgent_price * 100,
            OrderId: generateUniqueNumbers(),
            Token: hexDigest,
            SuccessURL: "ygdriver://urgent-order-payment-success",
            FailURL: "ygdriver://urgent-order-payment-failed"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    await Payments.deleteMany({
        driver_id: user_id,
        type: 'urgent'
    });
    const newSchema = new Payments({
        driver_id: user_id,
        order_id: orderId,
        type: 'urgent',
        isNew: true
    });
    await newSchema.save();
    try {
        const response = await fetch(PAYMENT_URL, requestData);
        console.log(response);
        return await response.json();
    } catch (error) {
        return {error: `Ошибка: ${error}`};
    }
}
