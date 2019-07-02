describe('all: /api/course', () => {
    describe('GET request', () => {
        // server function: courses()
    });
    describe('POST request', () => {
        // server function: createCourse()
    });
}); 

describe('active_assignments: /api/course/{:id}/assignments/active', () => {
    // server function: activeAssignments()
});

describe('all_assignments: /api/course/{:id}/assignments', () => {
    // server function: assignments()
}); 

describe('deleted_assignments: /api/course/{:id}/assignments/inactive', () => {
    // server function: inactiveAssignments()
});

describe('enrolled: /api/course/enrolled', () => {
    // server function: enrollments()
}); 
            
describe('course_user: /api/course/{:course_id}/user', () => {
    describe('GET request', () => {
        // server function: roster()
    });
    describe('DELETE request', () => {
        // server function: removeUser()
    });
    describe('POST request', () => {
        // server function: addUser()
    })
    describe('PUT request', () => {
        // server function: editRole()
    })
});

describe('roster: /api/course/{:course_id}/addRoster', () => {
    // server function: addRoster() 
});