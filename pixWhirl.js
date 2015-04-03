//Ensures that all required elements are generated before working with them.
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        init();
    }
}, 10);
// Color pairs
var aliveColors = ["#FFFFFF", "#E6B800", "#8AE62E","#FF9933"],
	deadColors = ["#000000","#323232","#5C8AE6", "#A319D1"];

//Canvas variables
var canvas, ctx, img, flag = false,

    //Mouse variables
	prevX = 0, currX = 0,
    prevY = 0, currY = 0,
	
	//canvas style variables
	xDim = 512,
	yDim = 512,
	pixelSize = 4,
	color = 1,
	
	//game state variables
    pixArr = [],
	lastIter = [],
	iterCountElem,
	livePixelElem,
	deadPixelElem,
	totalPixels = xDim*yDim,
	livePixelSum = 0,
	
	//iteration variables
	//iterCountElem,
	numIterations = 0,
	iter,
	isLooping = false,
	
	//game type variables
	useGameOfLife = true,
	useDayAndNight = false,
	useLifeWithoutDeath = false,
	useHighlife = false,
	wrapAround = true;
	
function getDocWidth() {
    var D = document;
    return Math.max(
        D.body.scrollWidth, D.documentElement.scrollWidth,
        D.body.offsetWidth, D.documentElement.offsetWidth,
        D.body.clientWidth, D.documentElement.clientWidth
    );
}
	
var init = function(){
	//get elements to be used/modified later
	canvas = document.getElementById("pixelContainer");
	ctx = canvas.getContext("2d");
	console.log(document.getElementById("pixelContainer"));
	img = document.getElementById("testImg");
	iterCountElem = document.getElementById("iterNum");
	livePixelElem = document.getElementById("livePixelNum");
	deadPixelElem = document.getElementById("deadPixelNum");
	
	// set size of things based on variables
	canvas.width = xDim;
	canvas.height = yDim;
	document.getElementById("mainContainer").width = xDim;
	document.getElementById("title").width = xDim;
	document.getElementById("dataContainer").width = xDim;
	document.getElementById("firstColumn").width = (getDocWidth()-xDim)/2;
	document.getElementById("buttonContainer thirdColumn").width = (getDocWidth()-xDim)/2;
	
	//ensure that canvas is empty
	ctx.clearRect(0,0,xDim,yDim);
	
	//canvas starts with a black background
	ctx.fillStyle = deadColors[color];
	ctx.fillRect(0,0,xDim,yDim);
	ctx.fillStyle = aliveColors[color];
	
	//do things based on mouse movement (currently not fully functional)
	canvas.addEventListener("mousemove", function (e) {
        findxy('move', e);
    }, false);
    canvas.addEventListener("mousedown", function (e) {
		//console.log(e.clientX+", "+e.clientY);
        findxy('down', e);
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e);
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e);
    }, false);
	
	//initialize sum
	livePixelSum = 0;
	
	//initialize state storage arrays
	for(i=0;i<xDim;i+=pixelSize){
		pixArr[i]=[];
		lastIter[i]=[];
		for(j=0;j<yDim;j+=pixelSize){
			pixArr[i][j] = 0;
			lastIter[i][j]= 0;
		}
	}
	//generate initial state of simulation using p(alive) = 0.5
	for(i=0;i<xDim;i+=pixelSize){
		for(j=0;j<yDim;j+=pixelSize){
			if(Math.floor(Math.random()+0.5)===1){
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
				livePixelSum++;
			}
		}
	}
	//display number of living cells
	livePixelElem.innerHTML = livePixelSum;
	deadPixelElem.innerHTML = totalPixels - livePixelSum;
}

// Changes game type based on radio buttons in HTML
var gameSelect = function(game){
	console.log("Function called with argument \""+game+"\"")
	if(game==="gameOfLife"){
		useGameOfLife = true,
		useDayAndNight = false,
		useLifeWithoutDeath = false,
		useHighlife = false;
	}else if(game==="dayAndNight"){
		useGameOfLife = false,
		useDayAndNight = true,
		useLifeWithoutDeath = false,
		useHighlife = false;
	}else if(game==="lifeWithoutDeath"){
		useGameOfLife = false,
		useDayAndNight = false,
		useLifeWithoutDeath = true,
		useHighlife = false;
	}else if(game==="highlife"){
		useGameOfLife = false,
		useDayAndNight = false,
		useLifeWithoutDeath = false,
		useHighlife = true;
	}
}

//reset playing field to a random state
var reset = function(defProb){
	//reset iteration counter
	numIterations = 0;
	iterCountElem.innerHTML = numIterations;
	//make sure current simulation has ended before resetting
	clearInterval(iter);
	isLooping = false;
	document.getElementById("start").innerHTML = "Start Simulation";
	//if user-inputted probability exists and is valid, use it; otherwise, use default value
	var probInput = document.getElementById("prob").value;
	var prob = defProb;
	if(!(probInput==="" || probInput<=0 || probInput>=1)){
		prob = parseFloat(probInput);
	}
	
	//clear previous simulation
	ctx.clearRect(0,0,xDim,yDim);
	livePixelSum = 0;
	
	//iterate over pixels
	for(i=0;i<xDim;i+=pixelSize){
		for(j=0;j<yDim;j+=pixelSize){
			//random probability succeeds
			if(Math.floor(Math.random()+prob)===1){
				//cell starts as alive
				ctx.fillStyle=aliveColors[color];
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
				livePixelSum++;
			}
			//random probability fails
			else{
				//cell starts as dead
				ctx.fillStyle=deadColors[color];
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=0;
				lastIter[i][j]=0
			}
		}
	}
	//display number of living cells
	livePixelElem.innerHTML = livePixelSum;
	deadPixelElem.innerHTML = totalPixels - livePixelSum;
	ctx.fillStyle=aliveColors[color];
}

//Calculates each pixel's state after one iteration
var nextIteration = function(){
	//count how long the simulation has been running
	numIterations++;
	
	//reset sum of pixels
	livePixelSum = 0;
	
	//check next state for each pixel
	for(x=0;x<xDim;x+=pixelSize){
		for(y=0;y<yDim;y+=pixelSize){
			if(x<xDim && y<yDim){
				//total+=1;
				pixChecker(x,y);
			}
		}
	}
	//change simulation to next state
	changeColor();
	iterCountElem.innerHTML = numIterations;
	
	//display number of living cells
	livePixelElem.innerHTML = livePixelSum;
	deadPixelElem.innerHTML = totalPixels - livePixelSum;
}

//Controls the "Start Simulation" button, which loops the simulation based on the number in ms to the right of the button.
var loop = function(msDefault){
	//get speed of loop
	var msInput = document.getElementById("ms").value;
	//if the loop is running, stop it
	if(isLooping){
		clearInterval(iter);
		isLooping = false;
		document.getElementById("start").innerHTML = "Start Simulation";
	//if loop isn't running, start it
	}else{
		isLooping = true;
		//if user wrote a value, use user input; if space is blank, use default value
		if(msInput==="" || msInput <=0){
			iter = setInterval(nextIteration, msDefault);
		}else{
			iter = setInterval(nextIteration, msInput)
		}
		document.getElementById("start").innerHTML = "Pause Simulation";
	}
}

//Checks to see whether pixel is alive or dead
var pixChecker = function(x,y){
	//sum = total number of living squares around selected pixel.
	var sum = 0;
	//if on top or left border
	if(x===0 || y===0){
		//if on both top and left border (0,0)
		if(x===0 && y===0){
			//check surrounding pixels
			for(i=x;i<=x+pixelSize;i+=pixelSize){
				for(j=y;j<=y+pixelSize;j+=pixelSize){
					//if (i,j) is not the center pixel
					if(!(i>=xDim || j>=yDim)/*i!==x && j!==y*/){
						//add pixel value to total
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				sum+=lastIter[0][yDim-pixelSize];
				sum+=lastIter[pixelSize][yDim-pixelSize];
				sum+=lastIter[xDim-pixelSize][0];
				sum+=lastIter[xDim-pixelSize][pixelSize];
				sum+=lastIter[xDim-pixelSize][yDim-pixelSize];
			}
		}
		//if on top border
		else if(x!==0 && y===0){
			//check surrounding pixels
			for(i=x-pixelSize;i<=x+pixelSize;i+=pixelSize){
				for(j=y;j<=y+pixelSize;j+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				var j = yDim-pixelSize;
				for(i=x-pixelSize;i<=x+pixelSize;i+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
		}
		else if(x===0 && y!==0){
			//check surrounding pixels
			for(i=x;i<=x+pixelSize;i+=pixelSize){
				for(j=y-pixelSize;j<=y+pixelSize;j+=pixelSize){
					//if (i,j) is not the center pixel and neither i nor j is greater than the size of the field
					if(!(i>=xDim || j>=yDim)){
						//add pixel value to total
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				var i = xDim-pixelSize;
				for(j=y-pixelSize;j<=y+pixelSize;j+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
		}
	}
	//if on either bottom or right border
	else if(x===xDim-pixelSize || y===yDim-pixelSize){
		//if on both bottom and right border (0,0)
		if(x===xDim-pixelSize && y===yDim-pixelSize){
			//check surrounding pixels
			for(i=x-pixelSize;i<=x;i+=pixelSize){
				for(j=y-pixelSize;j<=y;j+=pixelSize){
					//if (i,j) is not the center pixel
					if(!(i>=xDim || j>=yDim)/*i!==x && j!==y*/){
						//add pixel value to total
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				sum+=lastIter[xDim-2*pixelSize][0];
				sum+=lastIter[xDim-pixelSize][0];
				sum+=lastIter[0][0];
				sum+=lastIter[0][yDim-pixelSize];
				sum+=lastIter[0][yDim-2*pixelSize];
			}
		}
		//if on bottom border
		else if(x!==xDim-pixelSize && y===yDim-pixelSize){
			//check surrounding pixels
			for(i=x-pixelSize;i<=x+pixelSize;i+=pixelSize){
				for(j=y-pixelSize;j<=y;j+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				var j = 0;
				for(i=x-pixelSize;i<=x+pixelSize;i+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
		}
		//if on right border
		else if(x===xDim-pixelSize && y!==yDim-pixelSize){
			//check surrounding pixels
			for(i=x-pixelSize;i<=x;i+=pixelSize){
				for(j=y-pixelSize;j<=y+pixelSize;j+=pixelSize){
					//if (i,j) is not the center pixel and neither i nor j is greater than the size of the field
					if(!(i>=xDim || j>=yDim)){
						//add pixel value to total
						sum+=lastIter[i][j];
					}
				}
			}
			if(wrapAround){
				var i = 0;
				for(j=y-pixelSize;j<=y+pixelSize;j+=pixelSize){
					if(!(i>=xDim || j>=yDim)){
						sum+=lastIter[i][j];
					}
				}
			}
		}
	}
	//generic case (not on border)
	else{
		//check surrounding pixels
		for(i=x-pixelSize;i<=x+pixelSize;i+=pixelSize){
			for(j=y-pixelSize;j<=y+pixelSize;j+=pixelSize){
				//if (i,j) is not the center pixel and neither i nor j is greater than the size of the fieldcountOut++;
				if(!(i>=xDim || j>=yDim)){
					//add prev. value to total
					sum+=lastIter[i][j];
				}
			}
		}
	}
	//don't count pixel being checked
	if(pixArr[x][y]===1){
		sum--;
	}
	//choose which rule set to use
	if(useGameOfLife){
		gameOfLife(sum);
	}else if(useDayAndNight){
		dayAndNight(sum);
	}else if(useLifeWithoutDeath){
		lifeWithoutDeath(sum);
	}else if(useHighlife){
		highlife(sum);
	}else{ //default is Game of Life
		gameOfLife(sum);
	}
}

//use Game of Life rule set to determine state
var gameOfLife = function(sum){
	//if there are three living cells around it, the pixel lives
	if(sum===3){
		//change state to living
		pixArr[x][y] = 1;
	}
	//if there are 1 or fewer living cells or more than three living cells around it, the pixel dies
	else if(sum<=1 || sum>3){
		//change state to dead
		pixArr[x][y] = 0;
	}
}

//use Day and Night rule set to determine state
var dayAndNight = function(sum){
	//if there are three, six, seven, or eight living cells around it, the pixel lives
	if(sum===3 || sum===6 || sum===7 || sum===8){
		//change state to living
		pixArr[x][y] = 1;
	}
	//if there are 2 or fewer living cells or exactly five living cells around it, the pixel dies
	else if(sum<=2 || sum===5){
		//change state to dead
		pixArr[x][y] = 0;
	}
}

//Use Life without Death rule set to determine state
var lifeWithoutDeath = function(sum){
	// if there are three living cells around it, the pixel lives
	if(sum===3){
		pixArr[x][y] = 1;
	}
	//pixels never die
}

//use Highlife rule set to determine state
var highlife = function(sum){
	//if there are three living cells around it, the pixel lives; if there are six living cells around it AND is not alive, the pixel lives
	if(sum===3 || (sum===6 && pixArr[x][y]===0)){
		pixArr[x][y] = 1;
	}
	//if there are 1 or fewer living cells or more than three living cells around it, the cell dies
	else if(sum<=1 || sum>3){
		pixArr[x][y] = 0;
	}
}

//Draws changes from previous iteration
var changeColor = function(){
	//loop through rows
	for(i=0;i<xDim;i+=pixelSize){ 
		//for each pixel in row
		for(j=0;j<yDim;j+=pixelSize){
			//if pixel's next state is alive AND state is different from previous state, draw pixel as alive
			if(pixArr[i][j]===1){
				livePixelSum++;
				if(lastIter[i][j]!==1){
				ctx.fillStyle = aliveColors[color];
				ctx.fillRect(i,j,pixelSize,pixelSize);
				}
			//if pixel's next state is dead AND state has changed from previous state, draw pixel as dead
			}else{
				if(lastIter[i][j]!==0){
				ctx.fillStyle = deadColors[color];
				ctx.fillRect(i,j,pixelSize,pixelSize);
				}
			}
			//prepare lastIter for next iteration
			lastIter[i][j]=pixArr[i][j]
		}
	}
	//ensure that mouse draws in white
	ctx.fillStyle = aliveColors[color];
}

//Detects mouse position in the canvas and does things with that position (not fully functional yet)
function findxy(res, e) {
    debug_update(prevX, prevY, currX, currY, e.clientX, e.clientY);
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft + document.body.scrollLeft;
        currY = e.clientY - canvas.offsetTop + document.body.scrollTop;
            prevX = currX;
            prevY = currY;
		
		console.log(lastIter[currY-currY%pixelSize][currX-currX%pixelSize]);
		ctx.fillRect(currX-currX%pixelSize,currY-currY%pixelSize,pixelSize,pixelSize);
		pixArr[currX-currX%pixelSize][currY-currY%pixelSize] = 1;
		lastIter[currY-currY%pixelSize][currX-currX%pixelSize] = 1;
		console.log(lastIter[currY-currY%pixelSize][currX-currX%pixelSize]);
        flag = true;
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
		console.log(flag);
        if (flag) {
            currX = e.clientX - canvas.offsetLeft + document.body.scrollLeft;
            currY = e.clientY - canvas.offsetTop + document.body.scrollTop;
            prevX = currX;
            prevY = currY;
			ctx.fillRect(currX-currX%pixelSize,currY-currY%pixelSize,pixelSize,pixelSize);
			pixArr[currY-currY%pixelSize][currX-currX%pixelSize] = 1;
			lastIter[currY-currY%pixelSize][currX-currX%pixelSize] = 1;
        }
    }
}

function debug_update( pX, pY, nX, nY, cX, cY) {
  sp=document.getElementById('pX');
  sp.innerHTML = pX;
  sp=document.getElementById('pY');
  sp.innerHTML = pY;
  sp=document.getElementById('nX');
  sp.innerHTML = nX;
  sp=document.getElementById('nY');
  sp.innerHTML = nY;
  sp=document.getElementById('cX');
  sp.innerHTML = cX;
  sp=document.getElementById('cY');
  sp.innerHTML = cY;
}