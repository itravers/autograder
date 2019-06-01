 // Allows bulk user creation and addition to a course.
exports.addRoster = function(req, res, db, acl) {
    let session = req.session;
    let roster = req.body.roster;
    let course_id = req.body.course_id;
    let created_roster = []; 

    acl.canModifyCourse(req.session.user, course_id)
       .then(() => {
         for (let user of roster) {
            convertUser(user)
            // db.Users.exists(user.email)
               .then(() => convertUser(user))
               .then(() => db.Courses.addUser(course_id, user.id))
               .then(
                  result => res.json({ response: result })
               )
               .catch(err => {
                  // throws error here-- what is causing the 
                  // error and how can we handle it? 
                  res.json({ response: err });
               });
         }
      })
      .catch(err => {
         res.json({ response: err }); 
      })
 }

 // adds a user to the database if they don't already exist; 
 // deletes password from user object and adds their ID from DB
 exports.convertUser = function(user, db)
 {
    // does this user already exist in the database?
    db.Users.exists(user.email)
    .then(() =>{
       // user exists; select their id 
       db.Users.userRow(user.email, (result, err) => {
          if(err === null)
          {
             user.id = result.id; 
          }
          else
          {
             // THERE'S GOTTA BE A BETTER WAY TO DO THIS 
            throw err; 
          }
       })
    })
    .catch(() => {
      // user doesn't exist yet, add to database 
      db.Users.create(user, (result, err) => {
         if (err === null && result !== null)
         {
            user.id = result; 
         }
         else
         {
            //WTF HOW TO DEAL WITH THIS 
            throw err; 
         }
         user.id = result; 
      })
   }); 

    // delete password and return the resulting user 
    delete user.password;
    return user; 
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