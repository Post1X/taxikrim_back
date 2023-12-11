### Orders Schema Documentation

- **destination_start** (*Откуда*): Starting point of the journey.
- **destination_end** (*Куда*): Destination point of the journey.
- **full_address_start** (*Точный адрес начала пути*): Precise address of the starting location.
- **full_address_end** (*Точный адрес конца*): Precise address of the destination location.
- **date** (*Дата взятия заказа*): Date when the order was taken (in ISO format).
- **time** (*Время*): Time of the order.
- **car_type** (*Тариф*): Type of car service chosen.
- **baggage_count** (*Количество багажа*): Quantity of baggage included.
- **body_count** (*Количество человек*): Number of passengers.
- **animals** (*Животные*): Boolean indicating if animals are included.
- **booster** (*Бустер*): Boolean indicating if a booster is required.
- **kid** (*Детское кресло*): Boolean indicating if a child seat is required.
- **comment** (*Комментарий*): Additional comments or notes.
- **total_price** (*Общая цена*): Total price for the service.
- **commission** (*Комиссия*): Commission fee applied.
- **driver** (*Айди водителя*): ID of the assigned driver.
- **paymentMethod** (*Способ оплаты*): Payment method used (might be an ID).
- **dispatcher** (*Айди диспетчера*): ID of the dispatcher handling the order.
- **status** (*Айди статуса*): ID representing the status of the order (IDs will be provided).

This schema defines the structure of orders within the system, detailing various aspects of a transportation service request.
