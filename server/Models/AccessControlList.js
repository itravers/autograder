class AccessControlList {
   constructor(db) {
      this.db = db;

      this.canCreateCourses = this.canCreateCourses.bind(this);
      this.canGradeAssignment = this.canGradeAssignment.bind(this); 
      this.canModifyCourse = this.canModifyCourse.bind(this);
      this.isAdmin = this.isAdmin.bind(this);
      this.isLoggedIn = this.isLoggedIn.bind(this);
      this.isSessionUser = this.isSessionUser.bind(this); 
      this.userHasAssignment = this.userHasAssignment.bind(this);
      this.userOwnsFile = this.userOwnsFile.bind(this);
   }

   /**
    * Returns true if user can grade assignments for the given course.
    * @param {*} user
    * @param {*} course_id
    */
   canGradeAssignment(user, course_id){
      return new Promise((resolve, reject) => {
         this.db.Courses.canGrade(course_id, user.id)
         .then(result => 
            resolve(result))
         .catch(err => 
            reject(err));
      });
   }

   /**
    * Returns true if user can modify the given course.
    * @param {*} user
    * @param {*} course_id
    */
   canModifyCourse(user, course_id) {
      return new Promise((resolve, reject) => {
         this.db.Courses.canModify(course_id, user.id)
         .then(result => resolve(result))
         .catch(err => reject(err));
      });
   }

   /**
    * Returns true if the current user can create courses.
    * @param {*} session
    */
   //no "teacher" level so same as admin for now
   canCreateCourses(session) {
      return isAdmin(session);
   }

   /**
    * Returns true if the current user is an admin.
    * @param {*} session
    */
   isAdmin(session) {
      return new Promise((resolve, reject) => {
         if (session.user !== undefined
            && session.user !== null
            && session.user.is_admin === 1
         ) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Returns true if a user is currently logged into the session.
    * @param {*} session
    */
   isLoggedIn(session) {
      return new Promise((resolve, reject) => {
         if (session.user !== undefined && session.user !== null) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Returns true if the user identified by user_id is the logged-in user. 
    * @param {*} session 
    * @param {*} user_id
    */
   isSessionUser(session, user_id) {
      user_id = Number(user_id);
      return new Promise((resolve, reject) => {
         if (session.user.id === user_id) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Returns true if user is attached to the given assignment.  
    * @param {*} user 
    * @param {*} assignment_id
    */
   userHasAssignment(user, assignment_id) {
      return new Promise((resolve, reject) => {
         this.db.Assignments.hasUser(assignment_id, user.id)
            .then(result => {
               resolve(result);    
            })
            .catch(() => {
               reject(false); 
            });
      });
   }

   /**
    * Returns true if user owns the file identified by file_id.
    * @param {*} user 
    * @param {*} file_id
    */
   userOwnsFile(user, file_id) {
      return new Promise((resolve, reject) => {
        this.db.AssignmentFiles.get(file_id)
         .then(result => {
            if(result.owner_id == user.id) {
               resolve(true); 
            }
            else {
               reject(false); 
            }
         })
         .catch(() => {
            reject(false); 
         });
      });
   }
}

exports.createACL = function (db_connection) {
   return new AccessControlList(db_connection);
}