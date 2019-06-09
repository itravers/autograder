class ServerConstants {
   constructor() {
      this.mode = "DEBUG";
   }
}

class SharedConfig{
   constructor(){
      this.root_endpoint = "http://localhost:8080";

      this.buildEndpoints = this.buildEndpoints.bind(this);
      this.buildEndpoints();
   }

   constructRoute(path, params)
   {
      let next_arg = 0; 

      // while there is still an unreplaced {parameter} in path
      let regex_find = path.search(/{([^}]*)}/);  
      while(path.search(/{([^}]*)}/) > -1)
      {
         // replace whatever's in {} with the next passed argument
         path = path.replace(/{([^}]*)}/, params[next_arg]);
         next_arg++; 
      }
      return this.root_endpoint + path; 
   }

   buildEndpoints(){
      const root_endpoint = this.root_endpoint;
      this.endpoints = {
         root: root_endpoint,
         assignment: {
            // TODO: make all uses of assignment.file go through constructRoute()
            file: root_endpoint + "/api/assignment/file",
            test_cases: root_endpoint + "/api/assignment/{:assignment_id}/testCases",
            test_results: root_endpoint + "/api/assignment/testResults",
            run: root_endpoint + "/api/assignment/run",
            compile: root_endpoint + "/api/assignment/compile"
         },
         course: {
            all: root_endpoint + "/api/course",
            active_assignments: root_endpoint + "/api/course/assignments/active",
            all_assignments: root_endpoint + "/api/course/assignments",
            deleted_assignments: root_endpoint + "/api/course/assignments/inactive",
            course_user: root_endpoint + "/api/course/enrolled"
         },
         user: {
            create: root_endpoint + "/api/user/create",
            login: root_endpoint + "/api/user/login",
            logout: root_endpoint + "/api/user/logout"
         }
      };
   }
}

class DebugConfig extends SharedConfig {
   constructor() {
      super();
   }
}

class ReleaseConfig extends SharedConfig {
   constructor() {
      super();
   }
}

class ConfigManager {

   static getConfig() {
      const constants = new ServerConstants();
      if(constants.mode === "DEBUG"){
         return new DebugConfig();
      }
      else{
         return new ReleaseConfig();
      }
   }
}

export { ConfigManager };
export default ConfigManager;