import Session from '../view_models/Session.js';
import WebRequest from '../view_models/WebRequest.js';

class User {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;
      this.session = Session;
      this._user_key = "User.current_user";

      this.logIn = this.logIn.bind(this);
      this.currentUser = this.currentUser.bind(this);
      this.logOut = this.logOut.bind(this);
   }

   currentUser(){
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         const endpoint = this.config.endpoints.user.login;
         call(endpoint, (result) => {
            if (result !== null
               && result !== undefined
               && Object.keys(result.data).length > 0
            ) {
               //server has record of user
               this.session.set(this._user_key, result.data.response);
               resolve(result.data.response);
            }
            else {
               //server has no record of user
               this.session.set(this._user_key, {id: -1});
               resolve({id: -1});
            }
            
            //no need for reject, adding here for completeness
            reject(result);

         });
      });
      const current_user = this.session.get(this._user_key);
      if(current_user === null || current_user === undefined || Object.entries(current_user).length === 0 ){
         return {id: -1};
      }
      else{
         return {id: -1};
         return current_user;
      }
   }

   logIn(user_name, password) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const endpoint = this.config.endpoints.user.login;
         const user = { email: user_name, password: password };
         call(endpoint, user, (result) => {
            if (result !== null
               && result !== undefined
               && Object.keys(result.data.response).length > 0
               && result.data.response.id !== undefined
            ) {
               this.session.set(this._user_key, result.data.response);
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   logOut(){
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         const endpoint = this.config.endpoints.user.logout;
         call(endpoint, (result) => {
            if (result !== null
               && result !== undefined
            ) {
               this.session.set(this._user_key, {id: -1});
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }
}

export { User };
export default User;