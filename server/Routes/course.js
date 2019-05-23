 // returns all active assignments from the given course 
 exports.activeAssignments = function(req, res, db) {
    const course_id = req.params.id; 
    db.Courses.assignments(course_id, true, false, (result) => {
       res.json({response: result}); 
    })
 }

 // Adds the user to the specified course
exports.addUser = function(req, res, db, acl) {
    const course_id = req.params.course_id;
    const user_id = req.body.user_id;
    let session = req.session;
 
    acl.isLoggedIn(session)
       .then(acl.isSessionUser(session, user_id))
       .then(db.Courses.addUser(course_id, user_id))
       .then(
          result => res.json({ response: result })
       )
       .catch(err => {
          res.json({ response: err });
       });
 }

// returns all assignments from the given course 
exports.assignments = function(req, res, db) {
    const course_id = req.params.id;
    db.Courses.assignments(course_id, true, true, (result) => {
       res.json({ response: result });
    });
 }

 //Returns all available courses
exports.courses = function(req, res, db) {
    db.Courses.all((result) => { res.json({ response: result }); });
 }

 // Creates a course. 
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

 // Alters user's course role
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
 
// Returns all courses that the currently logged in user is taking
exports.enrollments = function(req, res, db) {
    const current_user = req.session.user;
    if (current_user !== undefined) {
       db.Courses.forUser(current_user.id, (result) => {
          res.json({ response: result });
       });
    }
    else {
       res.json({ response: {} });
    }
 }

 // returns all inactive assignments from the given course 
exports.inactiveAssignments = function(req, res, db) {
    const course_id = req.params.id; 
    db.Courses.assignments(course_id, false, true, (result) => {
       res.json({response: result}); 
    })
 }
 
// Removes the user specified in req.body from the selected course
 exports.removeUser = function(req, res, db, acl) {
    const course_id = req.params.course_id;
    const user_id = req.body.user_id;
    let session = req.session;
 
    acl.isLoggedIn(session)
       .then(acl.isSessionUser(session, user_id))
       .then(db.Courses.removeUser(course_id, user_id))
       .then(
          result => res.json({ response: result })
       )
       .catch(err => res.json({ response: err }));
 }

  /**
  * Returns a detailed roster for this course if the user has 
  * instructor rights
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