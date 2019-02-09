import Create from './Create'
import Login from './Login'

const routes = [
   {
      path: "/account/create",
      component: Create
   },
   {
      path: "/account/login",
      component: Login
   }
];

export default routes;
export {routes};