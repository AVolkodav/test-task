import express from 'express';
import { type Request, type Response } from 'express';
import config from '../config';
import AmoCRM from '../api/amo';
import RouterConstants from './router-constants';
import {getTotalSum, getMainContactId, getTommorowDate, taskIsExist} from '../utils';

const router = express.Router();
const constants = new RouterConstants();
const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

router.post('/', async (req: Request, res: Response) => {
    const [lead]= req.body.leads.update;
    if (!lead) {
        return;
    }
    const firstWebHook = +lead.modified_user_id;
    if (!firstWebHook) {
        return;
    }
    console.log("kaef");
    const [customField] = lead.custom_fields;
    if (+customField.id !== constants.SERVICE_FIELD_ID) {
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

    const tasksList = await api.getTasksByEntityId(lead.id);
    if (tasksList) {
        const leadTasks = tasksList._embedded.tasks;
        if (taskIsExist(constants.TASK_TEMPLATE, leadTasks)) {
            return;
        }
        console.log(leadTasks);
    }

    const tommorow = getTommorowDate(); 
    await api.createTask([{ ...constants.TASK_CREATE_DATA,
        complete_till: tommorow,
        entity_id: +lead.id,
        responsible_user_id: +lead.responsible_user_id 
    }]);
})

router.post('/task', async (req: Request, res: Response) => {
    const [task] = req.body.task.update;
    const [currentTask] = await api.getTasksByEntityId(task.element_id);
    if (currentTask) {
        return;
    }
    
    if (task) {        
        const isComplete = +task.status === constants.COMPLETE_TASK_STATUS && +task.action_close === constants.COMPLETE_TASK_ACTION_CLOSE;
        if (isComplete) {
            if (+task.task_type === constants.CHECK_TASK_TYPE_ID) {
                await api.createNoteById([constants.NOTE_DATA_TEMPLATE], task.element_id);
            }
        }
    }
})

export default router;
