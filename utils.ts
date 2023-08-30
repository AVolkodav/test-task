import moment from "moment";
import {Customfield} from "./types/customField/customField"
import fs, { mkdir } from "fs";
import { AccessTokenData } from "./types/oauth/accessTokenData";

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

// создает путь до файла (если директория не существует, то создает новую директорию)
const getPath = (filename: string, dirName: string) => {
    return `./${dirName}/${filename}.json`;
} 

// сохраняет данные при получении access токена в файл
const saveTokens = async (filename: string, tokensData: AccessTokenData, dirName: string = "tokens") => {
    fs.mkdir(dirName, (err) => {
        if (err) {
            return;
        }
        console.log('Папка успешно создана');
    });
    const path = getPath(filename, dirName);
    await fs.writeFileSync(path, JSON.stringify(tokensData));
}

// удаляет токены 
const deleteTokens = async (filename: string, dirName: string = "tokens") => {
    const path = getPath(filename, dirName);
    await fs.unlink(path, (_error) => {});
}

export {
	getClearPhoneNumber,
	getFieldValue,
	getFieldValues,
    makeField,
    getTodayDateTime,
    saveTokens,
    deleteTokens,
};
