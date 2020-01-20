import WebRequest from '../view_models/WebRequest.js';

class Assignment {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;

      this.getFiles = this.getFiles.bind(this);
      this.getTestCases = this.getTestCases.bind(this);
      this.run = this.run.bind(this);
      this.compile = this.compile.bind(this);
      this.submitAssignment = this.submitAssignment.bind(this);
      this.lockAssignment = this.lockAssignment.bind(this);
   }

   removeFile(file, assignment_id) {
      return new Promise((resolve, reject) => {
         const path = this.config.endpoints.assignment.file;
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         WebRequest.makeDelete(endpoint, { id: file.serverId }, (result) => {
            if (result !== null && result !== undefined) {
               resolve(file.file.name);
            }
            else {
               reject(file.file.name);
            }
         });
      });
   }

   getFiles(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         const endpoint = this.config.endpoints.assignment.user_files; 
         const url = this.config.constructRoute(endpoint, [assignment_id, user_id]);
         WebRequest.makeUrlRequest(url, (result) => {
            if (result !== null && result !== undefined) {
               const data = result.data.response;
               let file_data = {};
               let file_links = [];
               for (const item of data) {
                  item.type = "text/plain";
                  item.lastModified = 0;
                  item.name = item.file_name;
                  file_data[item.file_name] = item;
                  file_links.push(item);
               }
               resolve({ data: file_data, links: file_links });
            }
            else {
               reject(false);
            }
         });
      });

   }

   getTestCases(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   getTestResults(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.test_results;
         const endpoint = this.config.constructRoute(path, [assignment_id, user_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   run(assignment_id, test_case) {
      return this.compile(assignment_id, test_case, true);
   }

   compile(assignment_id, test_case, test_name, run_only = false) {
      return new Promise((resolve, reject) => {

         //never allow caching of compile calls
         let call = WebRequest.makePost;
         let path = this.config.endpoints.assignment.compile; 
         if (run_only === true) {
            path = this.config.endpoints.assignment.run; 
         }
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         call(endpoint, { stdin: test_case, test_name: test_name }, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   submitAssignment(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.submit_assignment;
         const endpoint = this.config.constructRoute(path, [assignment_id, user_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   lockAssignment(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.lock_assignment;
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }
}

export { Assignment };
export default Assignment;