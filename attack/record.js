var fs = require("fs");
var http = require('http');
var url = require('url');

// Create a server
http.createServer( function (request, response) {  
   // Parse the request containing file name
   var urlObj = url.parse(request.url, true);   
   response.writeHead(200, {'Content-Type': 'text/html'});	
   response.write('Username:'+urlObj.query.username);		
   response.write('Password:'+urlObj.query.password);

   fs.appendFile('data.txt', '\nUsername:'+urlObj.query.username+';Password:'+urlObj.query.password);

   // Send the response body 
   response.end();
}).listen(8091);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');