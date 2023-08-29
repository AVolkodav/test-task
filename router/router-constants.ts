class RouterConstants { 
    SERVICE_FIELD_ID = 1212207;
    CHECK_TASK_TYPE_ID = 3044666;
    COMPLETE_TASK_ACTION_CLOSE = 1;
    COMPLETE_TASK_STATUS = 1;

    TASK_CREATE_DATA = {
        task_type_id: this.CHECK_TASK_TYPE_ID,
        text: 'Проверить бюджет',
        entity_type: 'leads'
    };

    TASK_TEMPLATE = {
        id: 0,
        created_by: 0,
        updated_by: 0,
        created_at: 0,
        updated_at: 0,
        responsible_user_id: 0,
        group_id: 0,
        entity_id: 0,
        entity_type: 'leads',
        duration: 0,
        is_completed: false,
        task_type_id: this.CHECK_TASK_TYPE_ID,
        text: 'Проверить бюджет',
        complete_till: 0,
        account_id: 0,
        _links: { 
            self: {
                href: "",
            } 
        },
    }

    
    NOTE_DATA_TEMPLATE = {
        note_type: 'common',
        params: {
            text: 'Бюджет проверен, ошибок нет'
        },
        entity_type: 'leads'
    };
}

export default RouterConstants;