const { API_LOGIN, API_PASSWORD, API_URL } = process.env;

export async function getDispetcherById(dispetcher_id) {
    const requestData = {
        method: 'POST',
        body: JSON.stringify({
            method: 'getDispetcherById',
            api_login: API_LOGIN,
            api_password: API_PASSWORD,
            dispetcher_id: dispetcher_id
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
