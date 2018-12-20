class AccessControlList{
   constructor(db){
      this.db = db;
   }

   isLoggedIn(session){
      return new Promise( (resolve, reject) =>{
         if(session.user !== undefined || session.user !== null){
            resolve(true);
         }
         else{
            reject(false);
         }
      });
   }

   userHasAssignment(user, assignment_id){
      return new Promise( (resolve, reject) =>{
         this.db.Assignments.has_user(assignment_id, user.id, (result, err) => {
            if (result === true) {
               resolve(true);
            }
            else{
               reject(false);
            }
         });
      });
   }

   userOwnsFile(user, file_id){
      return new Promise( (resolve, reject) =>{
         this.db.AssignmentFiles.get(file_id, (result, err) => {
            if (result !== null && result.owner_id === user.id) {
               resolve(true);
            }
            else{
               reject(false);
            }
         });
      });
   }
}

exports.createACL = function (db_connection) {
   return new AccessControlList(db_connection);
}