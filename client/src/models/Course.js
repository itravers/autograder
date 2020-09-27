import WebRequest from '../view_models/WebRequest.js';

class Course {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;
      this.PRIVILEGES = {
         is_pending: "is_pending",
         can_submit_assignment: "can_submit_assignment",
         can_modify_course: "can_modify_course",
         can_grade_assignment: "can_grade_assignment"
      };
      this.getCoursesForUser = this.getCoursesForUser.bind(this);
      this.getActiveAssignmentsForCourse = this.getActiveAssignmentsForCourse.bind(this);
      this.getActiveAssignmentsForUser = this.getActiveAssignmentsForUser.bind(this);
      this.addUser = this.addUser.bind(this);
      this.all = this.all.bind(this);
      this.removeUser = this.removeUser.bind(this);
      this.getCoursePrivileges = this.getCoursePrivileges.bind(this);
      this.getCoursePrivilegeNumber = this.getCoursePrivilegeNumber.bind(this);
   }

   addUser(course_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const path = this.config.endpoints.course.course_user; 
         const endpoint = this.config.constructRoute(path, [course_id]); 
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
         const path = this.config.endpoints.course.all; 
         const endpoint = this.config.constructRoute(path, []);
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
         const path = this.config.endpoints.course.active_assignments; 
         const endpoint = this.config.constructRoute(path, [course_id]); 
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

   getActiveAssignmentsForUser(user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.course.active_user_assignments; 
         const endpoint = this.config.constructRoute(path, [user_id]); 
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
         is_pending: false,
         can_submit_assignment: false,
         can_modify_course: false,
         can_grade_assignment: false
      };

      if ((course_role & 0b1) > 0) {
         actions[this.PRIVILEGES.is_pending] = true;
      }
      if ((course_role & 0b10) > 0) {
         actions[this.PRIVILEGES.can_submit_assignment] = true;
      }
      if ((course_role & 0b100) > 0) {
         actions[this.PRIVILEGES.can_modify_course] = true;
      }
      if ((course_role & 0b1000) > 0) {
         actions[this.PRIVILEGES.can_grade_assignment] = true;
      }

      return actions;
   }

   /**
    * The inverse of getCoursePrivileges -> converts an object into a number
    * @param {object} actions 
    */
   getCoursePrivilegeNumber(actions){
      let privilege = 0;
   
      if(actions[this.PRIVILEGES.is_pending] === true){
         privilege = privilege | 1;
      }
      if(actions[this.PRIVILEGES.can_submit_assignment] === true){
         privilege = privilege | 2;
      }
      if(actions[this.PRIVILEGES.can_modify_course] === true){
         privilege = privilege | 4;
      }
      if(actions[this.PRIVILEGES.can_grade_assignment] === true){
         privilege = privilege | 8;
      }
      return privilege;
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
         const path = this.config.endpoints.course.enrolled;
         const endpoint = this.config.constructRoute(path, []);  
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
         const path = this.config.endpoints.course.course_user; 
         const endpoint = this.config.constructRoute(path, [course_id]);
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
         const path = this.config.endpoints.course.course_user; 
         const endpoint = this.config.constructRoute(path, [course_id]);
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

   setCourseRole(course_id, user_id, role){
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePut;
         const path = this.config.endpoints.course.course_user; 
         const endpoint = this.config.constructRoute(path, [course_id]);
         call(endpoint, { user_id: user_id, role: role }, (result) => {
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