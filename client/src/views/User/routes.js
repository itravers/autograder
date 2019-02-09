import Create from './Create'
import Login from './Login'

const routes = [
   {
      path: "/user/create",
      component: Create
   },
   {
      path: "/user/login",
      component: Login
   }
];

export default routes;
export {routes};