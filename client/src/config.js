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

   buildEndpoints(){
      const root_endpoint = this.root_endpoint;
      this.endpoints = {
         root: root_endpoint,
         assignment: {
            file: root_endpoint + "/api/assignment/file",
            test_cases: root_endpoint + "/api/assignment/testCases",
            run: root_endpoint + "/api/assignment/run",
            compile: root_endpoint + "/api/assignment/compile"
         },
         course: {
            for_user: root_endpoint + "/api/course/forUser",
            active_assignments: root_endpoint + "/api/course/assignments/active",
            all_assignments: root_endpoint + "/api/course/assignments",
            deleted_assignments: root_endpoint + "/api/course/assignments/inactive"
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