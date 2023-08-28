/**
 * Основной модуль приложения - точка входа. 
 */

const express = require("express");
const api = require("./api");
const logger = require("./logger");
const config = require("./config");
const utils = require("./utils.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api.getAccessToken().then(() => {
	app.get("/ping", (req, res) => res.send("pong " + Date.now()));

	app.post("/hook", (req, res) => {
		console.log(req.data);
		res.send("OK");
	});

	const CONTACT_AGE_FIELD_ID = 1163127;
	const BIRTH_DATE_FIELD_ID = 1160897;
	app.post("/", async (req, res) => {
		const contactId = req.body.contacts.add[0].id;	
		const contact = await api.getContact(contactId);	
		const birthDate = 1000 * utils.getFieldValue(contact.custom_fields_values, BIRTH_DATE_FIELD_ID);
		const age = utils.getAge(birthDate);
		console.log(age);
		const updatedContact = {
			id: contact.id,
			custom_fields_values: [
				utils.makeField(CONTACT_AGE_FIELD_ID, age)
			]
		};
		await api.updateContacts([updatedContact]);
	});

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});
