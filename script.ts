import express from "express";
import { Request, Response } from "express";
import config  from "./config";
import  AmoCRM  from "./api/amo";

const router = express.Router();
const SERVICE_FIELD_ID = 1212207;
const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

function getTotalSum(contactFields: any, checkedSevices: any): number {
  let totalSum = 0;
  for (let service of checkedSevices) {
    for (let field of contactFields){
      if (field.field_name == service.value) {
        totalSum += +field.values[0].value;
        break;
      }
    }
  }
  return totalSum;
}

function getMainContactId(links: any) {
  for( let link of links) {
    if (link.metadata.main_contact) {
      return link.to_entity_id;
    }
  }
  return -1;
}

router.post('/', async (req: Request, res: Response) => {
	const firstWebHook = req.body.leads.update[0].modified_user_id != 0;
  const updatedFieldId = req.body.leads.update[0].custom_fields[0].id;
  if (updatedFieldId == SERVICE_FIELD_ID && firstWebHook) {
		  const leadId = req.body.leads.update[0].id;
      const lead = await api.getLeadLinks(leadId);
      const contactId = getMainContactId(lead._embedded.links);
      if (contactId == -1){
        return;
      }
      const contact = await api.getContact(contactId);
      if (contact) {
        const checkedServices = req.body.leads.update[0].custom_fields[0].values
        const price = getTotalSum(contact.custom_fields_values, checkedServices);
        const leadUpdateData = {
          id: leadId,
          price: price
        }
        await api.updateDeals(leadId, leadUpdateData);
      }
      console.log('updated');
  }
})

export default router;