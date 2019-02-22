import WebRequest from '../view_models/WebRequest.js';

class Course {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;

      this.getCoursesForUser = this.getCoursesForUser.bind(this);
      this.getActiveAssignmentsForCourse = this.getActiveAssignmentsForCourse.bind(this);
      this.addUser = this.addUser.bind(this);
      this.all = this.all.bind(this);
      this.removeUser = this.removeUser.bind(this);
      this.getCoursePrivileges = this.getCoursePrivileges.bind(this);
   }

   addUser(course_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const endpoint = this.config.endpoints.course.course_user + "/" + course_id;
         call(endpoint, { user_id: user_id }, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   all() {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.course.all;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
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
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   /**
    * Returns an object of allowable course actions for the present course user's course_role
    * @param {Number} course_role 
    */
   getCoursePrivileges(course_role) {
      let actions = {
         can_submit_assignment: false,
         can_modify_course: false,
         can_grade_assignment: false
      };

      if ((course_role & 0b10) > 0) {
         actions["can_submit_assignment"] = true;
      }
      if ((course_role & 0b100) > 0) {
         actions["can_modify_course"] = true;
      }
      if ((course_role & 0b1000) > 0) {
         actions["can_grade_assignment"] = true;
      }

      return actions;
   }

   /**
 * Returns all courses that the currently logged in user is taking
 */
   getCoursesForUser() {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.course.course_user;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   /**
    * Returns all users attached to a particular course.  Note that caller needs to be
    * logged in and have instructor rights on the supplied course
    * @param {Number} course_id 
    */
   getCourseUsers(course_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.course.course_user + "/" + course_id;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   removeUser(course_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeDelete;
         const endpoint = this.config.endpoints.course.course_user + "/" + course_id;
         call(endpoint, { user_id: user_id }, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }
}

export { Course };
export default Course;