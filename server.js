/*
Tamara alhajj
100948027

CODE FROM PROF. RUNKA IS USED
*/

//An asynchronous server that serves static files

// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var func = require('./function');

const ROOT = "./public_html";

//to hold all players with respective boards
var users = {};

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res) {
	
	//make 4 the default size for board
	var level = 4;
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

	if(urlObj.pathname === "/memory/intro"){
		//initialize the game
		req.setEncoding('utf8');
		req.on('data', function(player) {
			player = JSON.parse(player);
			if(player.username in users && level < 10){ 
				//level up after win
				level +=2;
			}
			var data = {board: func.makeBoard(level), level: level};  
			users[player.username] = data;  //save player data in users
			respond(200, JSON.stringify(data)); 
		});
	}
	else if (urlObj.pathname === "/memory/card"){
        var data;
		try {
			data =(users[urlObj.query.username].board[urlObj.query.row][urlObj.query.col]).toString();
			respond(200, data);
		} catch (err) {
			respond(400, "index out of bounds");
		}
	} 

	else{// static server
	//the callback sequence for static serving...
		fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}else{
				if(stats.isDirectory())	filename+="/index.html";
		
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr(err);
					else respond(200,data);
				});
			}
		});
	}			
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request