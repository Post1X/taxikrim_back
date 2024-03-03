const fs = require('fs');

fs.readFile('db_drivers.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    try {
        const users = JSON.parse(data);
        const formattedUsers = users.map(user => {
            return {
                "firstName": user.user_firstname,
                "lastName": user.user_lastname,
                "lastLoginTime": user.user_registered,
                "phone": user.user_tel,
                "balance": user.user_balance,
                "avatar": user.user_avatarka,
                "passportArray": user.user_pasport,
                "carBrandId": user.user_car_marka,
                "carModel": user.user_car_model,
                "publicNumber": user.user_car_number,
                "carColor": user.user_car_color,
                "subToUrgentdate": user.user_date_end_premium,
                "telegram": user.user_tg,
                "regComplete": 'in_progress'
            };
        });

        // Преобразование обратно в JSON строку без массивных скобок и запятых между объектами
        const formattedJSON = formattedUsers.map(user => JSON.stringify(user)).join('\n');

        // Запись в новый файл
        fs.writeFile('formatted_data.json', formattedJSON, 'utf8', err => {
            if (err) {
                console.error('Ошибка записи в файл:', err);
                return;
            }
            console.log('Файл успешно переформатирован и сохранен как formatted_data.json');
        });
    } catch (error) {
        console.error('Ошибка парсинга JSON:', error);
    }
});
