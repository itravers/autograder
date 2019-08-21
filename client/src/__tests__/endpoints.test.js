import WebRequest from '../view_models/WebRequest.js';

// example: how to send web requests to server asynchronously, 
// then handle resulting data appropriately 
// 1.) on server: start up server with "node server.js"
// 2.) on client: run jest with "npm test"
describe('api endpoint requests', () => {
    test('should return API welcome message', done => {
        function callback(result) {
            expect(result.data.message).toBe("hooray! welcome to our api!"); 
            done(); 
        }
        WebRequest.makeUrlRequest("http://localhost:8080/api", callback); 
    });
}); 
