import express from "express";
import { mainLogger } from "./logger";
import config from "./config";
import router from "./auth_router/auth_router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(config.PORT,()=>mainLogger.debug('Server started on ', config.PORT))

