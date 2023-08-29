import express from 'express';
import { type Request, type Response } from 'express';
import config from './config';
import AmoCRM from './api/amo';
import {getTotalSum, getMainContactId, getTommorowDate} from './utils';

const router = express.Router();
const SERVICE_FIELD_ID = 1212207;
const CHECK_TASK_TYPE_ID = 3044666;
const COMPLETE_TASK_ACTION_CLOSE = 1;
const COMPLETE_TASK_STATUS = 1;

const TASK_CREATE_DATA = {
    task_type_id: CHECK_TASK_TYPE_ID,
    text: 'Проверить бюджет',
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
    const [lead]= req.body.leads.update;
    const firstWebHook = +lead.modified_user_id;
    if (!firstWebHook) {
        return;
    }

    const [customField] = lead.custom_fields;
    if (+customField.id !== SERVICE_FIELD_ID) {
        return;
    }

    const leadLinks = await api.getLeadLinks(lead.id);
    const contactId = getMainContactId(leadLinks._embedded.links);
    if (!contactId) {
        return;
    }

    const contact = await api.getContact(contactId)
    if (contact) {
        const checkedServices = customField.values;
        const price = getTotalSum(contact.custom_fields_values, checkedServices);
        await api.updateDeals(lead.id, {id: lead.id, price});
    }
    const tommorow = getTommorowDate(); 
    await api.createTask([{ ...TASK_CREATE_DATA, complete_till: tommorow, entity_id: +lead.id, responsible_user_id: +lead.responsible_user_id }]);
})

router.post('/task', async (req: Request, res: Response) => {
    const [task] = req.body.task.update;
    if (task) {        
        const isComplete = +task.status === COMPLETE_TASK_STATUS && +task.action_close === COMPLETE_TASK_ACTION_CLOSE;
        if (isComplete) {
            if (+task.task_type === CHECK_TASK_TYPE_ID) {
                await api.createNoteById([NOTE_DATA_TEMPLATE], task.element_id);
            }
        }
    }
})

export default router;
