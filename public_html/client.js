/*
Tamara alhajj
100948027
*//*
Tamara alhajj
100948027

CODE FROM PROF. RUNKA IS USED
*/

var user = "";
var prevTile = null;
var prevData = null;
var level = 4;
var twoFlipped = false; //so no double click when some are already flipped
var guesses = 0;
var winners = 0;

$(document).ready(function(){
	//start the game, display with POST
	while(user === ""){
		user = window.prompt("What is your name?");
	}
	$.ajax({
  		method:"POST",
  		url:"/memory/intro",
  		data: JSON.stringify({'username':user}),
  		success: displayGame,
  		dataType:'json'
	});
});

function displayGame(data){
	//show new board
	var index;
	level = data.level;
    $(function(){
        $("#gameboard").empty();    //empty old board
        for (var i=0; i < data.level; i++){  //rows
            var row = $("<tr></tr>");
            for (var j=0; j < data.level; j++){ //cols
                var div = $("<div class='unflippedTile' data-row='"+i+"' data-col='"+j+"'></div>"); //create new tile from scratch 
                div.click(chooseTile); //on click choose this tile
				row.append(div);
            }
            $("#gameboard").append(row);
        }
	});
}

function chooseTile(){
	//on click send tile's info and deal with in playGame
	var currentTile = $(this);
	$.get("/memory/card?username="+user+"&row="+currentTile.data('row')+"&col="+currentTile.data('col'),function(data){playGame(data,currentTile)});
}

function playGame(data, current){ 

	if(current.hasClass("flippedTile") || twoFlipped){ //same tile clicked 
		console.log("double click");
	}else if(prevTile === null){ //card is face down and no other cards are active	
		//add number value to tile
		console.log("condition 2");
		current.append("<span>"+data+"</span>");
		current.attr("class", "flippedTile");
		//reset
		prevTile = current;
		prevData = data;
	}else{ //card is face down and one other card is active
		console.log("condition 3");
		guesses++;
		if(prevData !== data){ //not a match
			console.log("condition 3a");
			//then show and reset after delay
			current.append("<span>"+data+"</span>");
			current.attr("class", "flippedTile");
			twoFlipped = true;
			setTimeout(function(){
				prevTile.attr("class", "unflippedTile");
				current.attr("class", "unflippedTile");
				
				//remove number value
				prevTile.find("span").remove(); 
				current.find("span").remove();
				
				prevTile = null;
				prevData = null; 
				twoFlipped = false;}
				, 1000);
		}else{   //match, leave both cards face up (but neither are 'active')
			
			current.append("<span>"+data+"</span>");
			current.attr("class", "flippedTile");
			twoFlipped = true; 
			
			prevTile = null;
			prevData = null;
			
			twoFlipped = false;
			winners++;
		}
		
		if(winners === (level/2)*level){ 
			setTimeout(function(){
				winners = 0;
				alert("YOU WON in "+guesses+" guesses... Now loading new game."); //all cards are matched
				guesses = 0;
				level = 0;
				$.ajax({
					method:"POST",
					url:"/memory/intro",
					data: JSON.stringify({'username':user}),
					success: displayGame,
					dataType:'json'
				});
			}
			, 2000);
		}	
	}
}	