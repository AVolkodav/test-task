import express from "express";
import { Request } from "express";
import  AmoCRM  from "./api/amo";
import { mainLogger } from "./logger"
import config from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(config.PORT,()=>mainLogger.debug('Server started on ', config.PORT))


app.get("/login", async (req : Request) => {
	const authCode = String(req.query.code);
	const subDomain = String(req.query.referer).split(".")[0];
	mainLogger.debug("Запрос на установку получен");
	const api = new AmoCRM(subDomain, authCode);
	await api.getAccessToken()
		.then(() => mainLogger.debug(`Авторизация при установке виджета для ${subDomain} прошла успешно`))
		.catch((err:any) => mainLogger.debug("Ошибка авторизации при установке виджета ", subDomain, err.data));
});
