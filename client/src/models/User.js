import Session from '../view_models/Session.js';
import WebRequest from '../view_models/WebRequest.js';

class User {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;
      this.session = Session;
      this._user_key = "User.current_user";

      this.create = this.create.bind(this);
      this.logIn = this.logIn.bind(this);
      this.currentUser = this.currentUser.bind(this);
      this.logOut = this.logOut.bind(this);
   }

   create(user){
      const self = this;
      return new Promise((resolve, reject) =>{
         let call = WebRequest.makePost;
         const path = self.config.endpoints.user.create; 
         const endpoint = self.config.constructRoute(path, []); 
         call(endpoint, {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password
         }, (result) => {
            if (result !== null
               && result !== undefined
               && result.data.response !== undefined
               && result.data.response.id !== undefined
            ) { 
               self.session.set(self._user_key, result.data.response);
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
         });
      });
   }

   currentUser(){
      const self = this;
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         const path = self.config.endpoints.user.login;
         const endpoint = self.config.constructRoute(path, []); 
         call(endpoint, (result) => {
            if (result !== null
               && result !== undefined
               && Object.keys(result.data).length > 0
            ) {
               //server has record of user
               self.session.set(self._user_key, result.data.response);
               resolve(result.data.response);
            }
            else {
               //server has no record of user
               self.session.set(self._user_key, {id: -1});
               resolve({id: -1});
            }
            
            //no need for reject, adding here for completeness
            reject(result);

         });
      });
   }

   logIn(user_name, password) {
      const self = this;
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const path = self.config.endpoints.user.login;
         const endpoint = self.config.constructRoute(path, []); 
         const user = { email: user_name, password: password };
         call(endpoint, user, (result) => {
            if (result !== null
               && result !== undefined
               && Object.keys(result.data.response).length > 0
               && result.data.response.id !== undefined
            ) {
               self.session.set(self._user_key, result.data.response);
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   logOut(){
      const self = this;
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         const path = self.config.endpoints.user.logout;
         const endpoint = self.config.constructRoute(path, []); 
         call(endpoint, (result) => {
            if (result !== null
               && result !== undefined
            ) {
               self.session.set(this._user_key, {id: -1});
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