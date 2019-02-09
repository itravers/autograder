import { UPDATE_USER } from "../actions/constants";
import ConfigManager from '../config'
import User from "../models/User"; 
import Course from '../models/Course';
import Assignment from "../models/Assignment";
var config = ConfigManager.getConfig();
const initialState = {
   current_user: { id: -1 },
   models:{
      user: new User(config),
      course: new Course(config),
      assignment: new Assignment(config)
   }
};
function rootReducer(state = initialState, action) {
   if (action.type === UPDATE_USER){
      return Object.assign({}, state, {current_user: action.payload});
   }
      return state;
};
export default rootReducer;