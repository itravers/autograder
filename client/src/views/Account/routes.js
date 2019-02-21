import Create from './Create'
import Login from './Login'

const routes = [
   {
      path: "/account/create",
      component: Create,
      strict_match: false
   },
   {
      path: "/account/login",
      component: Login,
      strict_match: false
   }
];

export default routes;
export {routes};