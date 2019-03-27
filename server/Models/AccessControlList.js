class AccessControlList {
   constructor(db) {
      this.db = db;

      this.canCreateCourses = this.canCreateCourses.bind(this);
      this.canModifyCourse = this.canModifyCourse.bind(this);
      this.isAdmin = this.isAdmin.bind(this);
      this.isLoggedIn = this.isLoggedIn.bind(this);
      this.userHasAssignment = this.userHasAssignment.bind(this);
      this.userOwnsFile = this.userOwnsFile.bind(this);
   }

   canGradeAssignment(user, course_id){
      return new Promise((resolve, reject) => {
         this.db.Courses.canGrade(course_id, user.id)
         .then(result => resolve(result))
         .catch(err => reject(err));
      });
   }

   canModifyCourse(user, course_id) {
      return new Promise((resolve, reject) => {
         this.db.Courses.canModify(course_id, user.id)
         .then(result => resolve(result))
         .catch(err => reject(err));
      });
   }

   //no "teacher" level so same as admin for now
   canCreateCourses(session) {
      return isAdmin(session);
   }

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

   userHasAssignment(user, assignment_id) {
      return new Promise((resolve, reject) => {
         this.db.Assignments.hasUser(assignment_id, user.id, (result, err) => {
            if (result === true) {
               resolve(true);
            }
            else {
               reject(false);
            }
         });
      });
   }

   userOwnsFile(user, file_id) {
      return new Promise((resolve, reject) => {
         this.db.AssignmentFiles.get(file_id, (result, err) => {
            if (result !== null && result.owner_id === user.id) {
               resolve(true);
            }
            else {
               reject(false);
            }
         });
      });
   }
}

exports.createACL = function (db_connection) {
   return new AccessControlList(db_connection);
}