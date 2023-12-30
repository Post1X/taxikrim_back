const { API_LOGIN, API_PASSWORD, API_URL } = process.env;

export async function driverBuyOrder(order_id, driver_id) {
    console.log(order_id, 'aaa')
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            method: 'driverBuyOrder',
            api_login: API_LOGIN,
            api_password: API_PASSWORD,
            order_id: order_id,
            driver_id: driver_id
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
