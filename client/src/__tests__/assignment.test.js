import WebRequest from '../view_models/WebRequest.js';
// import Session from '../view_models/Session.js'; 
import User from '../models/User.js'
import Course from '../models/Course.js'
import ConfigManager from '../config.js'
import { fail } from 'assert';

const config = ConfigManager.getConfig(); 
const user = new User(config);
const course = new Course(config); 

// TODO: create database setup and teardown functions so we're not 
// relying on the presence of bob@admin.com and his assignment files
// for these tests  

const uid = 1; 
const aid = 1; 

const admin_user = "bob@admin.com"; 
const admin_pass = "password"; 
let new_student = {
    email: "test@student.com", 
    first_name: "Test", 
    last_name: "Student", 
    password: "password"
};

// creates a new student in DB for testing 
function createStudent() {
    
    // create user 
    user.create(new_student)
    .then(result => {
        new_student.id = result.data.response.id;
        return new Promise((resolve, reject) => {
            resolve(new_student); 
        })
    })
    .then(() => user.logIn(new_student.email, new_student.password))
    .then(() => course.addUser(1, new_student.id))
    .then(() => )
    .catch(err => {
        fail('new student creation error'); 
    });
        // add to course
        // create assignment files for this user
}

beforeAll(() => {
    return createStudent(); 
})

// steps:
// create user 
// add to CS 211 class 
// accept to CS 211 class (but should test what happens if they're not accepted)
// add files 

describe.only('user_files: /api/assignment/{:aid}/user/{:uid}/file', () => {
    // server function: assignmentFiles()
    // user must have assignment
    // tests:
    // no active user (nobody logged into session)
    // session user doesn't have the given assignment (isn't part of the course) 
    // session user can't grade the given assignment, but has assignments (success)
    // session user has no assignments 
    // session user CAN grade the given assignment (success)
    // invalid user ID/assignment ID? 
    test('should allow user to see only their own assignment files', () => { 
        // THEN start making request:
        // log in as this user 
        // have this user request bob@admin's files 
        // this user should not be able to grade, FYI 
        // return should contain user's files, not bob@admin's files 
    });
    /*
    test.only('should return error when nobody is logged in', done => {
        // log out 
        user.logOut()
        .then(() => {
            return new Promise((resolve, reject) => {
                
                // attempt to get user files
                const endpoint = config.endpoints.assignment.user_files; 
                const url = config.constructRoute(endpoint, [aid, uid]);
                WebRequest.makeUrlRequest(url, (result) => {
                    resolve(true); 
                    done(); 
                });
            });
        })
        .then((test_passed) => {
            expect(test_passed).toBe(true); 
        })
    });
    */
});

describe('file: /api/assignment/{:aid}/file', () => {
    describe('POST request', () => {
        // server function: uploadFile()
    });
    describe('DELETE request', () => {
        // server function: deleteFile()
    });
});

describe('test_cases: /api/assignment/{:assignment_id}/testCases', () => {
    // server function: getTestCases()
});

describe('test_results: /api/assignment/{:assignment_id}/user/{:user_id}/testResults', () => {
    // server function: getTestResults()
});

describe('run: /api/assignment/{:assignment_id}/run', () => {
    // server function: run()
});

describe('compile: /api/assignment/{:assignment_id}/compile', () => {
    // server function: compileAndRun()
});