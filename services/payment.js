import { log } from "debug";

const { TERMINAL_KEY, PAYMENT_URL } = process.env;

const generateUniqueNumbers = () => {
    let result = '';
    while (result.length < 36) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

let cachedOrderId = generateUniqueNumbers(); // Генерируем OrderId заранее
export async function getPaymentUrl(orderData, UserData, item) {
    console.log(cachedOrderId);
    console.log(TERMINAL_KEY)
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            TerminalKey: TERMINAL_KEY,
            Amount: orderData.Amount,
            OrderId: generateUniqueNumbers(),
            Description: orderData.Description,
            Token: orderData.Token,
            SuccessURL: "success",
            FailURL: "fail",
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
        return { error: `Ошибка: ${error}` };
    }
}
