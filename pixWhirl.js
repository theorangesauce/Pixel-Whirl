//Ensures that all required elements are generated before working with them.
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        init();
    }
}, 10);

//Canvas Variables
var canvas, ctx, img, flag = false,

    //Mouse variables
	prevX = 0, currX = 0,
    prevY = 0, currY = 0,
	
	//canvas size variables
	xDim = 1024,
	yDim = 512,
	pixelSize = 4,
	
	//state container variables
    pixArr = [],
	lastIter = [],
	
	//iteration variables
	iterCountElem,
	numIterations = 0,
	iter,
	isLooping = false;
	
var init = function(){
	//get elements to be used/modified later
	canvas = document.getElementById("pixelContainer");
	ctx = canvas.getContext("2d");
	console.log(document.getElementById("pixelContainer"));
	img = document.getElementById("testImg");
	iterCountElem = document.getElementById("iterNum");
	
	// set size of things based on variables
	canvas.width = xDim;
	canvas.height = yDim;
	document.getElementById("mainContainer").width = xDim;
	document.getElementById("title").width = xDim;
	document.getElementById("dataContainer").width = xDim;
	
	//canvas starts with a back background
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,xDim,yDim);
	ctx.fillStyle = "#FFFFFF";
	
	//do things based on mouse movement (currently not fully functional)
	canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
		//console.log(e.clientX+", "+e.clientY);
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
	
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
			}
		}
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
	//iterate over pixels
	for(i=0;i<xDim;i+=pixelSize){
		for(j=0;j<yDim;j+=pixelSize){
			//random probability succeeds
			if(Math.floor(Math.random()+prob)===1){
				//cell starts as alive
				ctx.fillStyle="#FFFFFF";
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
			}
			//random probability fails
			else{
				//cell starts as dead
				ctx.fillStyle="#000000";
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=0;
				lastIter[i][j]=0
			}
		}
	}
	ctx.fillStyle="#FFFFFF";
}

//Calculates each pixel's state after one iteration
var nextIteration = function(){
	//count how long the simulation has been running
	numIterations++;
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
	//if not on left or top border
	if(x!==0 && y!==0){
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
	}
	//if on both top and left border (0,0)
	else{
		//check surrounding pixels
		for(i=x;i<=x+pixelSize;i+=pixelSize){
			for(j=y;j<=y+pixelSize;j+=pixelSize){
				//if (i,j) is not the center pixel
				if(i!==x && j!==y){
					//add pixel value to total
					sum+=lastIter[i][j];
				}
			}
		}
	}
	if(pixArr[x][y]===1){
		sum--;
	}
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

//Draws changes from previous iteration
var changeColor = function(){
	//loop through rows
	for(i=0;i<xDim;i+=pixelSize){ 
		//for each pixel in row
		for(j=0;j<yDim;j+=pixelSize){
			//if pixel's next state is alive AND state is different from previous state, draw pixel as alive
			if(pixArr[i][j]===1){
				if(lastIter[i][j]!==1){
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(i,j,pixelSize,pixelSize);
				}
			//if pixel's next state is dead AND state has changed from previous state, draw pixel as dead
			}else{
				if(lastIter[i][j]!==0){
				ctx.fillStyle = "#000000";
				ctx.fillRect(i,j,pixelSize,pixelSize);
				}
			}
			//prepare lastIter for next iteration
			lastIter[i][j]=pixArr[i][j]
		}
	}
	//ensure that mouse draws in white
	ctx.fillStyle = "#FFFFFF";
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