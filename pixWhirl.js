var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        init();
    }
}, 10);

var canvas, ctx, img, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
	xDim = 1024,
	yDim = 512,
	pixelSize = 4,
    pixArr = [],
	lastIter = [],
	iter,
	isLooping = false;
	
var init = function(){
	canvas = document.getElementById("pixelContainer");
	ctx = canvas.getContext("2d");
	console.log(document.getElementById("pixelContainer"));
	img = document.getElementById("testImg");
	
	//
	canvas.width = xDim;
	canvas.height = yDim;
	document.getElementById("mainContainer").width = xDim;
	document.getElementById("title").width = xDim;
	document.getElementById("dataContainer").width = xDim;
	
	//ctx.drawImage(img, 0, 0,500,500);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,xDim,yDim);
	ctx.fillStyle = "#FFFFFF";
	
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
	for(i=0;i<xDim;i+=pixelSize){
		pixArr[i]=[];
		lastIter[i]=[];
		for(j=0;j<yDim;j+=pixelSize){
			pixArr[i][j] = 0;
			lastIter[i][j]= 0;
		}
	}
	for(i=0;i<xDim;i+=pixelSize){
		for(j=0;j<yDim;j+=pixelSize){
			if(Math.floor(Math.random()+0.5)===1){
				ctx.fillRect(i,j,pixelSize,pixelSize);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
			}
		}
	}
	console.log(pixArr===lastIter);
}

//reset playing field to a random state
var reset = function(defProb){
	clearInterval(iter);
	isLooping = false;
	document.getElementById("start").innerHTML = "Start Simulation";
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
	var total = 0
	for(x=0;x<xDim;x+=pixelSize){
		for(y=0;y<yDim;y+=pixelSize){
			if(x<xDim && y<yDim){
				total+=1;
				pixChecker(x,y);
			}
		}
	}
	changeColor();
}

var loop = function(msDefault){
	var msInput = document.getElementById("ms").value;
	if(isLooping){
		clearInterval(iter);
		isLooping = false;
		document.getElementById("start").innerHTML = "Start Simulation";
	}else{
		isLooping = true;
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

//draw changes
var changeColor = function(){
	for(i=0;i<xDim;i+=pixelSize){
		for(j=0;j<yDim;j+=pixelSize){
			//if(lastIter[i][j]!==pixArr[i][j]){
				if(pixArr[i][j]===1){
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(i,j,pixelSize,pixelSize);
				}else{
					ctx.fillStyle = "#000000";
					ctx.fillRect(i,j,pixelSize,pixelSize);
				}
				lastIter[i][j]=pixArr[i][j]
			//}
		}
	}
	ctx.fillStyle = "#FFFFFF";
}

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