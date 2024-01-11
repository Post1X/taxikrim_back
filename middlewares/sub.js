import Drivers from "../schemas/DriversSchema";

const sub = async (req, res, next) => {
    try {
        const {user_id} = req;
        const organisation = await Drivers.findOne({
            _id: user_id
        });
        if (organisation) {
            if (organisation.subscription_status && organisation.subscription_status === true) {
                const orgdate = new Date(organisation.subscription_until);
                const currentDate = new Date();
                const orgDay = orgdate.getDate();
                const orgMonth = orgdate.getMonth();
                const currentDay = currentDate.getDate();
                const currentMonth = currentDate.getMonth();

                if (currentMonth !== orgMonth || currentDay !== orgDay) {
                    console.log('Organization subscription is active. Moving to the next middleware.');
                    return next();
                } else {
                    await Drivers.updateOne({
                        _id: user_id
                    }, {
                        subscription_until: null,
                        subscription_status: false
                    });
                    console.log('Organization subscription has expired. Updating and moving to the next middleware.');
                    return next();
                }
            }

            if (organisation.subToUrgent && organisation.subToUrgent === true) {
                const urgentdate = new Date(organisation.subToUrgentDate);
                const urgDay = urgentdate.getDay();
                const urgMonth = urgentdate.getMonth();
                const currentDate = new Date();
                const currentDay = currentDate.getDate();
                const currentMonth = currentDate.getMonth();

                if (currentMonth !== urgMonth || currentDay !== urgDay) {
                    console.log('Urgent subscription is active. Moving to the next middleware.');
                    return next();
                } else {
                    await Drivers.updateOne({
                        _id: user_id
                    }, {
                        subToUrgentDate: null,
                        subToUrgent: false
                    });
                    console.log('Urgent subscription has expired. Updating and moving to the next middleware.');
                    return next();
                }
            }

            console.log('No subscription found. Moving to the next middleware.');
            next();
        }
        next();
    } catch (e) {
        console.error('Error in subscription middleware:', e);
        e.status = 401;
        next(e);
    }
};

export default sub;
