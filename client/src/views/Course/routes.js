import Index from './Index'
import Manage from './Manage'
import AssignmentsList from './AssignmentsList';

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
   },
   {
      path: "/course/:id/assignments",
      component: AssignmentsList,
      strict_match: true
   }
];

export default routes;
export {routes};