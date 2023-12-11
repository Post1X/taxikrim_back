import https from 'https';

export default async function findCity(text) {
    const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=20bca3d8-7d07-4e1f-8383-83efa72d1ee4&text=${text}&type=geo`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const filteredResults = json.results.filter(result => result.tags.includes("locality"));
                    resolve(filteredResults);
                } catch (error) {
                    console.error(error);
                    reject('error');
                }
            });
        }).on('error', (error) => {
            console.error(error);
            reject('error');
        });
    });
}
