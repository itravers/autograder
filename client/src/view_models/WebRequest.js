import axios from 'axios';

class WebRequest {

   /**
    * Makes a GET web request that will be cached in future calls (currently no expiration)
    * @param {*} url 
    * @param {*} callback 
    */
   static makeCacheableUrlRequest(url, callback) {
      if (sessionStorage.getItem(url) === null) {
         axios(url).then(result => {
            sessionStorage.setItem(url, JSON.stringify(result));
            callback(result);
         });
      }
      else {
         callback(JSON.parse(sessionStorage.getItem(url)));
      }
   }

   /**
    * Makes a GET web request without caching the result.
    * @param {*} url 
    * @param {*} callback 
    */
   static makeUrlRequest(url, callback) {
      axios(url).then(result => {
         callback(result);
      });
   }

   static makePost(url, post, callback){
      axios.post(url, post).then(callback);
   }
}

export { WebRequest };
export default WebRequest;