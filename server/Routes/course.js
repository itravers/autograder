 /**
  * Helper function for addRoster().
  * Adds a user to the database if they don't already exist; 
  * deletes password from user object and adds their ID from DB.
  * @param {Object} user The user object. 
  * @param {Object} db Database connection. 
  * @returns {Promise} Resolves with user object with password removed if successful;
  *   rejects with error otherwise. 
  */
convertUser = function(user, db)
{
  return new Promise((resolve, reject) => {
     db.Users.exists(user.login)
     .then(() => {
        // select existing user's ID 
        db.Users.userRow(user.login)
        .then((result) => {
           user.id = result.id;
           delete user.password; 
           resolve(user);  
        })
        .catch((err) => {
           reject(err); 
        });
     })
     .catch(() => {
        // create user in DB 
        if ((user.first_name !== undefined) && (user.first_name.length > 0)
         && (user.last_name !== undefined) && (user.last_name.length > 0)
         && (user.login !== undefined) && (user.login.length > 0)
         && (user.password !== undefined) && (user.password.length > 0)) {
            db.Users.create(user)
               .then(result => {
                  user.id = result;
                  delete user.password;
                  resolve(user);
               })
               .catch(err => {
                  reject(err); 
               });
        }
        else {
           reject("missing required parameters"); 
        }
     });
  });
}

/** 
 * Allows bulk user creation and addition to a course.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} acl Object containing AccessControlList methods. 
 * @returns {Object} If the logged-in user doesn't have permission to modify 
 *    course, returns JSON error. Else, returns JSON response containing a roster of 
 *    students with either a user object or an error message for each student.
 */
exports.addRoster = function(req, res, db, acl) {
  let session = req.session;
  let roster = req.body.roster;
  let course_id = req.params.course_id;
  let output_roster = []; 

  // does the logged-in user have permission to change the course?
  acl.canModifyCourse(session.user, course_id)
     .then(() => {
        // for each user in roster
         let user_promises = roster.map(user => { 
            // add to DB if they don't already exist 
            return convertUser(user, db)
               // then add to course if not already added 
               .then(() => db.Courses.addUser(course_id, user.id))
               .then(() => {
                  output_roster.push(user); 
               })
               .catch(err => {
                  let err_message = {
                     login: user.login, 
                     error: err
                  };
                  output_roster.push(err_message); 
               });
         })
         return Promise.all(user_promises).then(() => {
            return output_roster; 
         });
      })
      .then(() => {
         res.json({response: output_roster})
      })
      .catch(err => {
         res.json({ response: err })
      });
}
 
 /** 
  * Returns all active assignments from the given course.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @returns {Object} JSON response with all active assignments if successful, 
  *   or an error message otherwise. 
  */
 exports.activeAssignments = function(req, res, db) {
    const course_id = req.params.id; 
    db.Courses.assignments(course_id, true, false)
      .then(result => 
         res.json({ response: result })
      )
      .catch(err =>
         res.json({ response: err })
      );
 }

 /**
  * Adds the logged-in user to the specified course
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @param {Object} acl Object containing AccessControlList methods. 
  * @returns {Object} JSON response with row ID for newly added user in 
  *   database if successful, or error message otherwise. 
  */
exports.addUser = function(req, res, db, acl) {
    const course_id = req.params.course_id;
    let session = req.session;
    const user_id = session.user.id; 
 
    acl.isLoggedIn(session)
       .then(() => db.Courses.addUser(course_id, user_id))
       .then(
          result => res.json({ response: result })
       )
       .catch(err => {
          res.json({ response: err });
       });
 }

/**  
 * Returns all assignments from the given course.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 *    False if we want to show the assignment given by req.params.id.
 * @returns {Object} JSON response with all assignments from given course, 
 *    or with error message if unsuccessful. 
 */
exports.assignments = function(req, res, db) {
   const course_id = req.params.id;
   db.Courses.assignments(course_id, true, true)
        .then(result => 
           res.json({ response: result })
        )
        .catch(err =>
           res.json({ response: err })
        );
 }

 /**  
 * Returns all assignments for the given user.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 *    False if we want to show the assignment given by req.params.id.
 * @returns {Object} JSON response with all assignments from given user, 
 *    or with error message if unsuccessful. 
 */
exports.userAssignments = function(req, res, db) {
   const user_id = req.params.user_id;
   db.Courses.userAssignments(user_id, true, true)
        .then(result => 
           res.json({ response: result })
        )
        .catch(err =>
           res.json({ response: err })
        );
 }

  /**  
 * Returns all active assignments for the given user.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 *    False if we want to show the assignment given by req.params.id.
 * @returns {Object} JSON response with all assignments from given user, 
 *    or with error message if unsuccessful. 
 */
exports.userAssignmentsActive = function(req, res, db) {
   const user_id = req.params.user_id;
   db.Courses.userAssignments(user_id, true, false)
        .then(result => 
           res.json({ response: result })
        )
        .catch(err =>
           res.json({ response: err })
        );
 }

 /** 
  * Returns all available courses.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @returns {Object} JSON response with all available courses, or with 
  *   error message if unsuccessful. 
  */
exports.courses = function(req, res, db) {
   db.Courses.all()
   .then(result => 
      res.json({ response: result })
   )
   .catch(err => 
      res.json({response: err})
   );
}

 /** 
  * Creates a course. 
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @param {Object} acl Object containing AccessControlList methods. 
  * @returns {Object} JSON response with new course's ID if successful, or 
  *   with error message if unsuccessful for any reason. 
  */
 exports.createCourse = function(req, res, db, acl) {
    let session = req.session;
    const school_id = req.body.school_id;
    const name = req.body.name;
    const term = req.body.term;
    const year = req.body.year;
 
    // does the current user have permission to create courses? 
    acl.isAdmin(session)
    
       // is the course that this user wants to add unique? 
       .then(() => db.Courses.isUnique(school_id, name, term, year))
       
       // if so, call course creation 
       .then(() => db.Courses.addCourse(school_id, name, term, year))
       .then(
          result => res.json({ response: result })
       )
       .catch(err =>
          res.json({ response: err })
       );
 }

 /** 
  * Alters user's course role.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @param {Object} acl Object containing AccessControlList methods. 
  * @returns {Object} JSON response with number of database table rows affected
  *   if successful, or with error message if unsuccessful for any reason. 
  */
exports.editRole = function(req, res, db, acl) {
    const course_id = req.params.course_id;
    const user_id = req.body.user_id;
    const role = req.body.role;
    let session = req.session;
 
    acl.isLoggedIn(session)
       .then(() => acl.canModifyCourse(session.user, course_id))
       .then(() => db.Courses.setCourseRole(course_id, user_id, role))
       .then(
          result => res.json({ response: result })
       )
       .catch(err =>
          res.json({ response: err })
       );
 }
 
/** 
 * Returns all courses that the currently logged in user is taking.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @returns {Object} JSON response with all courses that the user is taking, or 
 *    with an error message or an empty response if unsuccessful. 
 */
exports.enrollments = function(req, res, db) {
   const current_user = req.session.user;
   if (current_user !== undefined) {
      db.Courses.forUser(current_user.id)
       .then(result => 
          res.json({ response: result })
      )
      .catch(err =>
         res.json({ response: err })
      );
   }
   else {
       res.json({ response: {} });
   }
 }

 /** 
  * Returns all inactive assignments from the given course.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @returns {Object} JSON response with all inactive assignments from the 
  *   course if successful, or with an error message otherwise. 
  */
exports.inactiveAssignments = function(req, res, db) {
    const course_id = req.params.id; 
    db.Courses.assignments(course_id, false, true)
   .then(result => 
      res.json({ response: result })
   )
   .catch(err =>
      res.json({ response: err })
   );
 }
 
/** 
 * Removes the user specified in req.body from the selected course.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} acl Object containing AccessControlList methods. 
 * @returns {Object} JSON response with the number of rows deleted if successful, 
 *    or with error message otherwise. 
 */
 exports.removeUser = function(req, res, db, acl) {
   const course_id = req.params.course_id;
   const user_id = req.body.user_id;
   let session = req.session;

   acl.isLoggedIn(session)
      .then(() => acl.isSessionUser(session, user_id))
      .then(() => db.Courses.removeUser(course_id, user_id))
      .then(
         result => res.json({ response: result })
      )
      .catch(err => res.json({ response: err }));
   }

  /**
  * Returns a detailed roster for this course if the user has 
  * instructor rights.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @param {Object} acl Object containing AccessControlList methods. 
  * @returns {Object} JSON response with detailed roster for this course, or 
  *   with error message if unsuccessful. 
  */
 exports.roster = function(req, res, db, acl) {
    const course_id = req.params.course_id;
    let session = req.session;
    acl.isLoggedIn(session)
 
       .then(() => acl.canModifyCourse(session.user, course_id))
       .then(() => db.Courses.courseUsers(course_id))
       .then(result => {
          res.json({ response: result });
       })
       .catch(err => res.json({ response: err }));
 }