import Index from './Index'
import Grader from './GraderView'

const routes = [
   {
      path: "/assignment",
      component: Index,
      strict_match: true
   },
   {
      path: "/assignment/add-files",
      component: Index,
      strict_match: true
   },
   {
      path: "/assignment/files",
      component: Index,
      strict_match: false
   },
   {
      path: "/assignment/run",
      component: Index,
      strict_match: true
   },
   {
      path: "/assignment/grade",
      component: Grader,
      strict_match: false
   },
];

export default routes;
export {routes};