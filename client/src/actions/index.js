let nextTodoId = 0;
export const updateUserDN = text => ({
    type: 'UPDATE_DISPLAY_NAME',
    id: nextTodoId++,
    text
});

export const initUser = userObj => ({
    type: 'INIT',
    id: nextTodoId++,
    userObj
});