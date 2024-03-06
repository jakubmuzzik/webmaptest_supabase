import { combineReducers } from 'redux'
import { user } from './user'
import { app } from './app'

const rootReducer = combineReducers({
    appState: app,
    userState: user
})

export default rootReducer