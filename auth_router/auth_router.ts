import express  from "express";
import AmoCRM from "../api/amo";
import config from "../config";
import { OauthData } from "../types/oauth/oauthData";
import { deleteTokens, saveTokens} from "../utils";

const router = express.Router();
const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

const OAUTH_DATA: OauthData = {
    client_secret: config.CLIENT_SECRET,
    grant_type: GrantType.accessToken,    
    redirect_uri: config.REDIRECT_URI,
    client_id: "",
    code: "",
}

router.get('/install', async (req, res) => {
    const query = req.query;
    const clientId = String(query.client_id);

    const oauthData: OauthData = {
        ...OAUTH_DATA,
        client_id: clientId,
        code: String(query.code),        
    };

    const token = await api.getTokens(oauthData);
    await saveTokens(clientId, token);

    return res.sendStatus(200);
});

router.get('/delete', async (req, res) => {
    const clientId = String(req.query.client_uuid);
    await deleteTokens(clientId);
    
    return res.sendStatus(200);    
})

export default router;