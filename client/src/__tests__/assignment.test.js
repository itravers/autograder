import WebRequest from '../view_models/WebRequest.js';
import ConfigManager from '../config.js'

const config = ConfigManager.getConfig(); 

// TODO: create database setup and teardown functions so we're not 
// relying on the presence of bob@admin.com and his assignment files
// for these tests  

const uid = 1; 
const aid = 1; 

describe.only('user_files: /api/assignment/{:aid}/user/{:uid}/file', () => {
    // server function: assignmentFiles()
    // tests:
    // no active user (nobody logged into session)
    // session user doesn't have the given assignment (isn't part of the course) 
    // session user can't grade the given assignment, but has assignments (success)
    // session user has no assignments 
    // session user CAN grade the given assignment (success)
    // invalid user ID/assignment ID? 
    test.only('should return error when nobody is logged in', done => {
        // log out 
        WebRequest.makeUrlRequest(config.endpoints.user.logout, result => {
            if(result.data.response === null)
            {
                // attempt to get user files 
                const endpoint = config.endpoints.assignment.user_files; 
                const url = config.constructRoute(endpoint, [aid, uid]);
                WebRequest.makeUrlRequest(url, (result) => {
                    expect(result.data.status).toBe(500); 
                    /*
                    if (result !== null && result !== undefined) {
                        const data = result.data.response;
                        expect(result.data.status).toBe(500); 
                        done(); 
                    }
                    else {
                        done.fail(); 
                    }
                    */
                });
            }
            else
            {
                done.fail(); 
            }
        });
    });
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