import {
    USER_STATE_CHANGE,
    USER_AUTH_STATE_CHANGE,
    CLEAR_DATA,
    LADIES_STATE_CHANGE
} from '../actionTypes'

const INITIAL_STATE = {
    currentUser: {},
    currentAuthUser: {},
    //ladies from establishemnt
    ladies: null
}

export const user = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case USER_STATE_CHANGE:
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    ...action.data
                }
            }
        case USER_AUTH_STATE_CHANGE:
            return {
                ...state,
                currentAuthUser: action.currentAuthUser,
            }
        case LADIES_STATE_CHANGE:
            return {
                ...state,
                ladies: action.ladies
            }
        case CLEAR_DATA:
            return {
                ...INITIAL_STATE
            }
        default:
            return state;
    }
}