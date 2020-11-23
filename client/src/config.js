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
      return path; 
   }

   buildEndpoints(){
      const root_endpoint = this.root_endpoint;
      this.endpoints = {
         root: root_endpoint,
         assignment: {
            create: root_endpoint + "/api/assignment",
            user_files: root_endpoint + "/api/assignment/{:aid}/user/{:uid}/file", 
            file: root_endpoint + "/api/assignment/{:aid}/file", 
            test_cases: root_endpoint + "/api/assignment/{:assignment_id}/testCases",
            test_results: root_endpoint + "/api/assignment/{:assignment_id}/user/{:user_id}/testResults",
            submit_assignment: root_endpoint + "/api/assignment/{:assignment_id}/user/{:user_id}/submitAssignment",
            lock_assignment: root_endpoint + "/api/assignment/{:assignment_id}/lockAssignment",
            is_locked: root_endpoint + "/api/assignment/{:assignment_id}/isLocked",
            date_mismatch: root_endpoint + "/api/assignment/{:assignment_id}/user/{:user_id}/dateMismatch",
            run: root_endpoint + "/api/assignment/{:assignment_id}/run",
            compile: root_endpoint + "/api/assignment/{:assignment_id}/compile",
            download_results: root_endpoint + "/api/assignment/{:assignment_id}/downloadResults",
            download_files: root_endpoint + "/api/assignment/{:assignment_id}/downloadFiles",
            grading_files_link: root_endpoint + "/api/assignment/{:assignment_id}/gradingFilesLink"
         },
         course: {
            all: root_endpoint + "/api/course",
            active_assignments: root_endpoint + "/api/course/{:id}/assignments/active",
            active_user_assignments: root_endpoint + "/api/course/assignments/active",
            user_assignments: root_endpoint + "/api/course/assignments",
            all_assignments: root_endpoint + "/api/course/{:id}/assignments",
            deleted_assignments: root_endpoint + "/api/course/{:id}/assignments/inactive",
            enrolled: root_endpoint + "/api/course/enrolled",
            course_user: root_endpoint + "/api/course/{:course_id}/user",
            roster: root_endpoint + "/api/course/{:course_id}/addRoster"
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