const { API_LOGIN, API_PASSWORD, API_URL } = process.env;

export async function getAllOpenOrders() {
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            method: 'getAllOpenOrders',
            api_login: API_LOGIN,
            api_password: API_PASSWORD
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
