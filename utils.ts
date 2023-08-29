import moment from "moment";
import {Customfield, CustomfieldValues} from "./types/customField/customField"
import { Link } from "./types/entityLinks/link";
import { Task } from "./types/task/task"

const getTodayDateTime = ():string => moment().format("YYYY-MM-DD HH:MM:ss");

const getClearPhoneNumber = (tel:string | undefined) => {
	const clearNumber = !tel ? [] : tel.split("").filter(item => new RegExp(/\d/).test(item));
	if (!clearNumber.length) {
		return undefined;
	}
	return clearNumber.length > 10 ? clearNumber.join("").slice(1) : clearNumber.join("");
};

const getFieldValue = (customFields:Array<Customfield>, fieldId:number) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id) === String(fieldId))
        : undefined;
    const value = field && field.values ? field.values[0].value : undefined;
    return value;
};

const getFieldValues = (customFields:Array<Customfield>, fieldId:number) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id) === String(fieldId))
        : undefined;
    const values = field && field.values ? field.values : [];
    return values.map((item: any) => item.value);
};

const makeField = (field_id:number, value?: string | number | boolean, enum_id?:number) => {
    if (!value) {
        return undefined;
    }
    return {
        field_id,
        values: [
            {
                value,
                enum_id
            },
        ],
    };
};

const getHuminizeTimeFromUnix = (unixTimeStamp: number) => {
    // Принимаем в секундах, моменту нужны миллисекунды
    const time = unixTimeStamp * 1000;
    return moment(time).format("YYYY-MM-DD HH:mm:ss.SSS")
};

const getUnixBithdate = (date:string) => {
    const unix = moment(date, "DD.MM.YYYY").utcOffset(0).unix();
    return unix;
};

const getDateUnixValue = (date:string) => {
    return moment(
        moment(date).utcOffset(3).format("DD.MM.YYYY HH:mm:ss"),
        "DD.MM.YYYY HH:mm:ss"
    ).unix();
};

const getUniqNumbers = (numbers:number[]):number[] => {
    const numberCollection = new Set();
    numbers.forEach((number) => numberCollection.add(number));
    const uniqNumbers = Array.from(numberCollection).map(Number);
    return uniqNumbers;
};

// функция получает на вход массив с ценами услуг и выбранные услуги,
// возвращает общую стоимость всех услуг
const getTotalSum = (contactFields: Array<Customfield>, checkedSevices: Array<CustomfieldValues>): number => {
    let totalSum = 0;
    for (const service of checkedSevices) {
        for (const field of contactFields) {
            if (field.field_name === service.value) {
                const [values] = field.values? field.values : [{value: 0}];  
                totalSum += values.value? +values.value : 0;
                break;
            }
        }
    }
    return totalSum;
}

// функция получает список контактов у сделки, возвращает id основного контакта
const getMainContactId = (links: Link[]): number => {
    for (const link of links) {
        if (link.metadata) {
            if (link.metadata.main_contact) {
                return link.to_entity_id ? link.to_entity_id : 0;
            }
        }
    }
    return 0;
}

// возвращает завтрашний день в формате числа в секундах
const getTommorowDate = () : number => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // переход на следующий день
    return Math.round(+date/1000); // перевод из милисекунд в секунды
}

// проверяет, существует ли задача в списке задач 
const taskIsExist = (newTask: Task, tasks: Task[]):boolean => {
    let result = false;
    tasks.forEach(task => {
        if (task.task_type_id === newTask.task_type_id &&
            task.text === newTask.text &&
            !task.is_completed) {
            result = true;
        }
    });
    return result;
}

export {
	getClearPhoneNumber,
	getFieldValue,
	getFieldValues,
    makeField,
    getUnixBithdate,
    getDateUnixValue,
    getTodayDateTime,
    getUniqNumbers,
    getHuminizeTimeFromUnix,
    getMainContactId,
    getTotalSum,
    getTommorowDate,
    taskIsExist
};
