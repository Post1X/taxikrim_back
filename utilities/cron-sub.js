import cron from "node-cron";
import Drivers from "../schemas/DriversSchema";

const asyncSearchFunction = async () => {
    try {
        const organisations = await Drivers.find();
        const currentDate = new Date();

        for (const organisation of organisations) {
            if (organisation.subscription_status && organisation.subscription_status === true) {
                const orgdate = new Date(organisation.subscription_until);
                const orgDay = orgdate.getUTCDate();
                const orgMonth = orgdate.getUTCMonth();

                if (
                    currentDate.getUTCMonth() === orgMonth &&
                    currentDate.getUTCDate() >= orgDay
                ) {
                    await Drivers.updateOne(
                        { _id: organisation._id },
                        {
                            subscription_until: null,
                            subscription_status: false,
                        }
                    );
                }
            }

            if (organisation.subToUrgent && organisation.subToUrgent === true) {
                const urgentdate = new Date(organisation.subToUrgentDate);
                const urgDay = urgentdate.getUTCDate();
                const urgMonth = urgentdate.getUTCMonth();

                if (
                    currentDate.getUTCMonth() === urgMonth &&
                    currentDate.getUTCDate() >= urgDay
                ) {
                    await Drivers.updateOne(
                        { _id: organisation._id },
                        {
                            subToUrgentDate: null,
                            subToUrgent: false,
                        }
                    );
                }
            }
        }

        console.log('Проверены все пользователи.');
    } catch (e) {
        console.error('Ошибка при проверке подписок:', e);
    }
};

asyncSearchFunction()
    .then(() => {
        console.log('ok');
    })
    .catch((error) => {
        console.error('Ошибка при поиске:', error);
    });

const setupSubCronTask = () => {
    const cronSchedule = '0 3 * * *';
    cron.schedule(cronSchedule, async () => {
        await asyncSearchFunction();
    }, { timezone: 'Europe/Moscow' });
};

export default setupSubCronTask;
