import { UPDATE_USER, UPDATE_COURSE_USER } from "../actions/constants";
import ConfigManager from '../config'
import User from "../models/User";
import Course from '../models/Course';
import Assignment from "../models/Assignment";
var config = ConfigManager.getConfig();

const initialState = {
   current_user: { id: -1 },
   course_user: {course_id: -1, course_role: 0 },
   models: {
      user: new User(config),
      course: new Course(config),
      assignment: new Assignment(config)
   },
   config: config
};
function rootReducer(state = initialState, action) {
   if (action.type === UPDATE_USER) {
      return Object.assign({}, state, { current_user: action.payload });
   }
   if (action.type === UPDATE_COURSE_USER) {
      return Object.assign({}, state, {course_user: action.payload});
   }
   return state;
};
export default rootReducer;