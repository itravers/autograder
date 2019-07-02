import WebRequest from '../view_models/WebRequest.js';
import ConfigManager from '../config.js'

const config = ConfigManager.getConfig(); 

// async jest tutorial-- https://jestjs.io/docs/en/asynchronous.html
// example: how to send web requests to server asynchronously, 
// then handle resulting data appropriately. 
// 1.) on server: start up server with "node server.js"
// 2.) on client: run jest with "npm test"
describe('api endpoint request', () => {
    test('should return API welcome message', done => {
        WebRequest.makeUrlRequest('http://localhost:8080/api', (result) => {
            expect(result.data.message).toBe('hooray! welcome to our api!'); 
            done(); 
        }); 
    });
}); 

describe('route configuration', () => {
    test('should return root endpoint when not given path', () => {
        expect(config.constructRoute()).toEqual(config.root_endpoint); 
    });
    test('should return endpoint with no request parameters', () => {
        const endpoint = 'http://localhost:8080/api';
        expect(config.constructRoute(endpoint)).toEqual(endpoint); 
    });
    test('should return endpoint with only 2 parameters', () => {
        const endpoint = 'http://localhost:8080/api/{:p1}/{:p2}'
        const too_many_params = [2, 4, 32];
        expect(config.constructRoute(endpoint, too_many_params)).toEqual('http://localhost:8080/api/2/4'); 
    });
    test('should return endpoint with an unfilled parameter in curly braces', () => {
        const endpoint = 'http://localhost:8080/api/test/{:p1}/{:p2}'; 
        const param = 1; 
        expect(config.constructRoute(endpoint, param)).toEqual('http://localhost:8080/api/test/1/{:p2}');
    });
})
