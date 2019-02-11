import {routes as AccountRoutes} from './Account/routes';
import {routes as CourseRoutes} from './Course/routes';
const routes = [].concat(AccountRoutes, CourseRoutes);
export {routes};
export default routes;