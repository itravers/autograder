/**
 * A basic abstraction for user sessions.  Not much here, but it will
 * allow me to more easily change session behavior later on if I 
 * decide to get more advanced.
 */
class Session {
   constructor() {
      this.persist = false;
   }

   get(key) {
      if (this.persist === true) {
         return JSON.parse(localStorage.getItem(key));
      }
      else {
         return JSON.parse(sessionStorage.getItem(key));
      }
   }

   set(key, value) {
      if (this.persist === true) {
         localStorage.setItem(key, JSON.stringify(value));
      }
      else {
         sessionStorage.setItem(key, JSON.stringify(value));
      }
   }

   isPersistent(val = null) {
      if (val === null) {
         return this.persist;
      }
      else {
         this.persist = val;
         if (this.persist === true) {
            localStorage.setItem("persist", "true");
         }
      }
   }
}

let instance = new Session();

export { instance as Session };
export default instance;