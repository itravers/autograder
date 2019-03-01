import WebRequest from '../view_models/WebRequest.js';

class Assignment {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;

      this.getTestCases = this.getTestCases.bind(this);
      this.run = this.run.bind(this);
      this.compile = this.compile.bind(this);
   }

   getTestCases(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const endpoint = this.config.endpoints.assignment.test_cases + "/" + assignment_id;
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0){
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
               
         });
      });
   }

   run(assignment_id, test_case){
      return this.compile(assignment_id, test_case, true);
   }

   compile(assignment_id, test_case, run_only = false){
      return new Promise((resolve, reject) => {

         //never allow caching of compile calls
         let call = WebRequest.makePost;
         let endpoint = this.config.endpoints.assignment.compile + "/" + assignment_id;
         if(run_only === true){
            endpoint = this.config.endpoints.assignment.run + "/" + assignment_id;
         }
         call(endpoint, {stdin: test_case}, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0){
               resolve(result.data.response);
            }
            else{
               reject(result);
            }
               
         });
      });
   }

}

export { Assignment };
export default Assignment;