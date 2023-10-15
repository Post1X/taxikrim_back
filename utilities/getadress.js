const apiKey = 'cd99dbd7-5c2c-4ca2-93d3-6e590ecc7f14';


export async function searchAddress(searchText) {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${searchText}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        const addressComponents = data.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
        const city = addressComponents[3].name;
        const district = addressComponents[4].name;
        const street = addressComponents[5].name;

        return `${city}, ${district}, ${street}`;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Пробрасываем ошибку дальше, чтобы её можно было обработать в вызывающем коде
    }
}

//

export async function searchCity(searchText) {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${searchText}&kind=locality`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data, 'city');
    return data.response.GeoObjectCollection.featureMember.map(item => item.GeoObject.name);
}
