import Index from './Index'
import Manage from './Manage'

const routes = [
   {
      path: "/course",
      component: Index,
      strict_match: true
   },
   {
      path: "/course/manage/:id",
      component: Manage,
      strict_match: true
   }
];

export default routes;
export {routes};