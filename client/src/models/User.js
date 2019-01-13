import Session from '../view_models/Session.js';
import WebRequest from '../view_models/WebRequest.js';

class User {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;
      this.session = Session;

      this.logIn = this.logIn.bind(this);
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
               ){
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
               
         });
      });
   }
}

export { User };
export default User;