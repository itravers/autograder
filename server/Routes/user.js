/* *
  * helper function for addRoster()
  * adds a user to the database if they don't already exist; 
  * deletes password from user object and adds their ID from DB
  */
convertUser = function(user, db)
 {
   return new Promise((resolve, reject) => {
      db.Users.exists(user.email)
      .then(() => {
         // select existing user's ID 
         db.Users.userRow(user.email)
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
         // TESTING: previously !== undefined 
         if ((user.first_name !== undefined) && (user.first_name.length > 0)) {
            if ((user.last_name !== undefined) && (user.last_name.length > 0)) {
               if ((user.email !== undefined) && (user.email.length > 0)) {
                  if (("password" in user) && (user.password.length > 0)) {
                     db.Users.create(user, (result, err) => {
                        if (err === null) {
                           user.id = result;
                           delete user.password;
                           resolve(user);
                        }
                        else {
                           reject(err); 
                        }
                     });
                  }
               }
            }
         }
         else {
            reject("missing required parameters"); 
         }
         /*
         db.Users.create(user, (result, err) => {
            if (err === null) {
               user.id = result;
               delete password; 
               resolve(user); 
            }
            else {
               reject(err); 
            }
         });*/
      });
   });
}

 // Allows bulk user creation and addition to a course.
 exports.addRoster = function(req, res, db, acl) {
   let session = req.session;
   let roster = req.body.roster;
   let course_id = req.body.course_id;
   let created_roster = []; 

   acl.canModifyCourse(req.session.user, course_id)
      .then(() => {
        for (let user of roster) {
           convertUser(user, db)
              .then(() => db.Courses.addUser(course_id, user.id))
              .then(result => {
                  res.json({ response: result })
              })
              .catch((err) => {
                 res.json({ response: err });
               });
        }
     })
     .catch(err => {
        res.json({ response: err }); 
     })
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