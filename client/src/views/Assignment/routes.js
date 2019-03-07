import Index from './Index'
import Grader from './GraderView'

const routes = [
   {
      path: "/assignment",
      component: Index,
      strict_match: false
   }
];

export default routes;
export {routes};