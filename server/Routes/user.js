// Allows bulk user creation.  
exports.addRoster = function(req, res, db){
    let session = req.session;
    let roster = req.body.roster;
    let course_id = req.body.course_id;
    acl.canModifyCourse(session, course_id)
       .then(() => {
          for (let user of roster) {
             db.Users.exists(user.email)
                .then()
                .catch(() => {
 
                   //user doesn't already exist, create
                   db.Users.create(user.email, user.first_name, user.last_name, user.password);
                });
          }
       })
       .catch((err) => { res.json({ response: err }); });
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
exports.login = function(req, res, db) {
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