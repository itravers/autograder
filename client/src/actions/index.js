import { UPDATE_USER, UPDATE_COURSE_USER } from "./constants";

export function updateUser(payload) {
  return { type: UPDATE_USER, payload };
}
export function updateCourseUser(payload) {
   return { type: UPDATE_COURSE_USER, payload };
 }