const user = (state = {}, action) => {
    let newState = state;
    switch (action.type) {
        case 'LOGIN':
            return action.user;
        case 'UPDATE_DISPLAY_NAME':
            newState.display_name = action.text;
            return newState;
        default:
            return state
    }
};

export default user