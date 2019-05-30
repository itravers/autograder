 // Allows bulk user creation and addition to a course.
exports.addRoster = function(req, res, db, acl) {
    let session = req.session;
    let roster = req.body.roster;
    let course_id = req.body.course_id;
    let created_roster = []; 

    acl.canModifyCourse(req.session.user, course_id)
       .then(() => {
          for (let user of roster) {
             db.Users.exists(user.email)
               .then(() => {
                  // select this user's ID 
                  db.Users.userRow(user.email, (result, err) =>{
                     // assuming err is null (LATER FIX: HANDLE ERRORS)
                     user.id = result.id; 
                     delete user.password; 
                  })
               })
               // if user doesn't exist, create them
               .catch(() => {
                  db.Users.create(user, (result, err) => {
                  
                  // assuming err is null and result has contents 
                  // (LATER FIX: HANDLE ERRORS)
                  user.id = result; 
                  delete user.password; 
                  })
               })
               .then(() => db.Courses.addUser(course_id, user.id))
               .then(
                  result => res.json({ response: result })
               )
               .catch(err => {
                  res.json({ response: err });
               });
 }
 
 // creates new user
 exports.createUser = function(req, res, db) {
    const user = { first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, password: req.body.password };
    if (user.first_name !== undefined && user.first_name.length > 0) {
       if (user.last_name !== undefined && user.last_name.length > 0) {
          if (user.email !== undefined && user.email.length > 0) {
             if (user.password !== undefined && user.password.length > 0) {
                db.Users.create(user, (result, err) => {
                   if (err === null) {
                      user.id = result;
                      delete user.password;
                      res.json({ response: user });
                   }
                   else {
                      res.json({ response: err });
                   }
                });
                return;
             }
          }
       }
    }
    res.json({ response: "missing required parameters" });
 }

// returns information on currently logged in user 
exports.info = function(req, res) {
    res.json({ response: req.session.user });
}

// logs in a user with given credentials 
exports.login = function(req, res, db){
    db.Users.authenticate(req.body.email, req.body.password, (result, err) => {
       if (err === null) {
          delete result.password;
          req.session.user = result;
          res.json({ response: result });
       }
       else {
          res.json({ response: err });
       }
    });
 }
 
 // logs out user 
exports.logout = function(req, res) {
    req.session.user = null;
    res.json({ response: req.session.user });
 }