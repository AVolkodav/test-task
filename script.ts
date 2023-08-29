import express from 'express';
import { type Request, type Response } from 'express';
import config from './config';
import AmoCRM from './api/amo';
import {getTotalSum, getMainContactId} from './utils';

const router = express.Router();
const SERVICE_FIELD_ID = 1212207;
const CHECK_TASK_TYPE_ID = 3044666;

const TASK_CREATE_DATA = {
    task_type_id: CHECK_TASK_TYPE_ID,
    text: 'Проверить бюджет',
    complete_till: Math.round(Date.now() / 1000 + 60 * 60 * 24),
    entity_type: 'leads'
};

const NOTE_DATA_TEMPLATE = {
    note_type: 'common',
    params: {
        text: 'Бюджет проверен, ошибок нет'
    },
    entity_type: 'leads'
};

const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

router.post('/', async (req: Request, res: Response) => {
    const lead = req.body.leads.update[0];
    const firstWebHook = +lead.modified_user_id != 0;
    if (!firstWebHook) {
        return;
    }
    const updatedFieldId = lead.custom_fields[0].id;
    if (updatedFieldId != SERVICE_FIELD_ID) {
        return;
    }
    const leadLinks = await api.getLeadLinks(lead.id);
    const contactId = getMainContactId(leadLinks._embedded.links);
    if (contactId === -1) {
        return;
    }
    const contact = await api.getContact(contactId)
    if (contact !== undefined) {
        const checkedServices = lead.custom_fields[0].values;
        const price = getTotalSum(contact.custom_fields_values, checkedServices);
        await api.updateDeals(lead.id, {id: lead.id, price});
    }
    await api.createTask([{ ...TASK_CREATE_DATA, entity_id: +lead.id, responsible_user_id: +lead.responsible_user_id }]);
})

router.post('/task', async (req: Request, res: Response) => {
    if (req.body.task.update) {
        const task = req.body.task.update[0];
        const isComplete = task.status == 1 && task.action_close == 1;
        if (isComplete) {
            if (task.task_type == CHECK_TASK_TYPE_ID) {
                await api.createNoteById([NOTE_DATA_TEMPLATE], task.element_id);
            }
        }
    }
})

export default router;
