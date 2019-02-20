import Index from './Index'
import Manage from './Manage'

const routes = [
   {
      path: "/course",
      component: Index
   },
   {
      path: "/course/manage",
      component: Manage
   }
];

export default routes;
export {routes};