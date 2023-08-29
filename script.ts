import express from 'express';
import { type Request, type Response } from 'express';
import config from './config';
import AmoCRM from './api/amo';

const router = express.Router();
const SERVICE_FIELD_ID = 1212207;
const CHECK_TASK_TYPE_ID = 3044666;
const TASK_CREATE_DATA = {
    task_type_id: CHECK_TASK_TYPE_ID,
    text: 'Проверить бюджет',
    complete_till: Math.round(Date.now() / 1000 + 60 * 60 * 24),
    entity_type: 'leads'
};
const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

function getTotalSum (contactFields: any, checkedSevices: any): number {
    let totalSum = 0;
    for (const service of checkedSevices) {
        for (const field of contactFields) {
            if (field.field_name === service.value) {
                totalSum += +field.values[0].value;
                break;
            }
        }
    }
    return totalSum;
}

function getMainContactId (links: any): number {
    for (const link of links) {
        if (link.metadata.main_contact === true) {
            return link.to_entity_id;
        }
    }
    return -1;
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req: Request, res: Response) => {
    const lead = req.body.leads.update[0];
    const firstWebHook = +lead.modified_user_id !== 0;
    const updatedFieldId = lead.custom_fields[0].id;
    if (!(+updatedFieldId === SERVICE_FIELD_ID && firstWebHook)) {
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
        const leadUpdateData = {
            id: lead.id,
            price
        };
        await api.updateDeals(lead.id, leadUpdateData);
    }
    console.log('updated');
    const responsibleUserId = +lead.responsible_user_id;
    await api.createTask([{ ...TASK_CREATE_DATA, entity_id: +lead.id, responsible_user_id: responsibleUserId }]);
})

const NOTE_TEMPLATE = {
    note_type: 'common',
    params: {
        text: 'Бюджет проверен, ошибок нет'
    },
    entity_type: 'leads'
};

router.post('/task', async (req: Request, res: Response) => {
    if (req.body.task.update) {
        const task = req.body.task.update[0];
        const isComplete = task.status == 1 && task.action_close == 1;
        if (isComplete) {
            await api.createNote([{ ...NOTE_TEMPLATE}], NOTE_TEMPLATE.entity_type, task.element_id);
            console.log('note');
        }
    }
})

export default router;
