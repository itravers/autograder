import Session from '../view_models/Session.js';
import WebRequest from '../view_models/WebRequest.js';

class Course {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;
      this.session = Session;

      this.getCoursesForUser = this.getCoursesForUser.bind(this);
      this.getActiveAssignmentsForCourse = this.getActiveAssignmentsForCourse.bind(this);
   }

   getCoursesForUser(user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.course.for_user + "/" + user_id;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0){
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
               
         });
      });
   }

   getActiveAssignmentsForCourse(course_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.course.active_assignments + "/" + course_id;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0){
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
               
         });
      });
   }
}

export { Course };
export default Course;