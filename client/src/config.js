class ServerConstants {
   constructor() {
      this.mode = "DEBUG";
   }
}

class SharedConfig{
   constructor(){
      const root_endpoint = "http://localhost:8080";

      this.endpoints = {
         root: root_endpoint,
         assignment: {
            file: root_endpoint + "/api/assignment/file"
         },
         course: {
            for_user: root_endpoint + "/api/course/forUser",
            active_assignments: root_endpoint + "/api/course/assignments/active",
            all_assignments: root_endpoint + "/api/course/assignments",
            deleted_assignments: root_endpoint + "/api/course/assignments/inactive"
         },
         user: {
            login: root_endpoint + "/api/user/login"
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