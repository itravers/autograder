import Index from './Index'
import Manage from './Manage'
import EditUser from './EditUser'

const routes = [
   {
      path: "/admin",
      component: Index,
      strict_match: true
   },
   {
      path: "/admin/manage/:id",
      component: Manage,
      strict_match: true
   },
   {
      path: "/admin/user/:id",
      component: EditUser,
      strict_match: true
   }
];

export default routes;
export {routes};