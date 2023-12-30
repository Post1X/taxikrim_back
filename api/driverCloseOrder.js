const { API_LOGIN, API_PASSWORD, API_URL } = process.env;

export async function driverCloseOrder(order_id) {
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            method: 'driverCloseOrder',
            api_login: API_LOGIN,
            api_password: API_PASSWORD,
            order_id: order_id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(API_URL, requestData);
        return await response.json();
    } catch (error) {
        return { error: `Ошибка: ${error}` };
    }
}
