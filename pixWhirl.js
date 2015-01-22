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
	xDim = 256,
	yDim = 256,
    pixArr = [],
	lastIter = [];
	
var init = function(){
	
	canvas = document.getElementById("pixelContainer");
	ctx = canvas.getContext("2d");
	console.log(document.getElementById("pixelContainer"));
	img = document.getElementById("testImg");
	
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
	for(i=0;i<xDim;i+=4){
		pixArr[i]=[];
		lastIter[i]=[];
		for(j=0;j<yDim;j+=4){
			pixArr[i][j] = 0;
			lastIter[i][j]= 0;
		}
	}
	for(i=0;i<xDim;i+=4){
		for(j=0;j<yDim;j+=4){
			if(Math.floor(Math.random()+0.1)===1){
				ctx.fillRect(i,j,4,4);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
			}
		}
	}
	console.log(pixArr===lastIter);
}

//reset playing field to a random state
var reset = function(prob){
	//iterate over pixels
	for(i=0;i<xDim;i+=4){
		for(j=0;j<yDim;j+=4){
			//random probability succeeds
			if(Math.floor(Math.random()+prob)===1){
				//cell starts as alive
				ctx.fillStyle="#FFFFFF";
				ctx.fillRect(i,j,4,4);
				pixArr[i][j]=1;
				lastIter[i][j]=1;
			}
			//random probability fails
			else{
				//cell starts as dead
				ctx.fillStyle="#000000";
				ctx.fillRect(i,j,4,4);
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
	for(x=0;x<xDim;x+=4){
		for(y=0;y<yDim;y+=4){
			//console.log(""+x+", "+y);
			if(x<256 && y<256){
				total+=1;
				pixChecker(x,y);
			}
		}
	}
	console.log(lastIter===pixArr);
	//console.log(total);
	changeColor();
}

//Checks to see whether pixel is alive or dead
var pixChecker = function(x,y){
	//console.log("X: "+x+", Y: "+y);
	//sum = total number of living squares around selected pixel.
	var sum = 0
	//if not on left or top border
	if(x!==0 && y!==0){
		//check surrounding pixels
		for(i=x-4;i<=x+4;i+=4){
			for(j=y-4;j<=y+4;j+=4){
				//if (i,j) is not the center pixel and neither i nor j is greater than the size of the field
				if((i!==x && j!==y)&& !(i>=xDim || j>=yDim)){
					//add prev. value to total
					sum+=lastIter[i][j];
				}
			}
		}
	}
	//if on top border
	else if(x!==0 && y===0){
		//check surrounding pixels
		for(i=x-4;i<=x+4;i+=4){
			for(j=y;j<=y+4;j+=4){
				if((i!==x && j!==y)&&!(i>=xDim ||j>=yDim)){
					sum+=lastIter[i][j];
				}
			}
		}
	}
	else if(x===0 && y!==0){
		//check surrounding pixels
		for(i=x;i<=x+4;i+=4){
			for(j=y-4;j<=y+4;j+=4){
				//if (i,j) is not the center pixel and neither i nor j is greater than the size of the field
				if((i!==x && j!==y)&& !(i>=xDim ||j>=yDim)){
					//add pixel value to total
					sum+=lastIter[i][j];
				}
			}
		}
	}
	//if on both top and left border (0,0)
	else{
		//check surrounding pixels
		for(i=x;i<=x+4;i+=4){
			for(j=y;j<=y+4;j+=4){
				//if (i,j) is not the center pixel
				if(i!==x && j!==y){
					//add pixel value to total
					sum+=lastIter[i][j];
					//console.log(sum);
				}
			}
		}
	}
	//if there are three living cells around it, the pixel lives
	if(x===140&&y===224){
		console.log(sum);
	}
	if(sum===3){
		//change state to living
		pixArr[x][y] = 1;
		//console.log("living to living or dead to living")
		//console.log(pixArr[x][y]+", "+lastIter[x][y]);
	}
	//if there are 1 or fewer living cells or more than three living cells around it, the pixel dies
	else if(sum<=1 || sum>3){
		//change state to dead
		pixArr[x][y] = 0;
		//console.log("living to dead")
		//console.log(pixArr[x][y]+", "+lastIter[x][y]);
	}
}

var changeColor = function(){
	for(i=0;i<xDim;i+=4){
		//console.log("1 X-value...")
		for(j=0;j<yDim;j+=4){
			//console.log(j)
			console.log(lastIter[i][j] !== pixArr[i][j]);
			//if(lastIter[i][j]!==pixArr[i][j]){
				if(pixArr[i][j]===1){
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(i,j,4,4);
				}else{
					ctx.fillStyle = "#000000";
					ctx.fillRect(i,j,4,4);
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
		
		
		ctx.fillRect(currX-currX%4,currY-currY%4,4,4);
		pixArr[currX-currX%4][currY-currY%4] = 1;
        flag = true;
		/*
        dot_flag = false;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }*/
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            currX = e.clientX - canvas.offsetLeft + document.body.scrollLeft;
            currY = e.clientY - canvas.offsetTop + document.body.scrollTop;
            prevX = currX;
            prevY = currY;
			ctx.fillRect(currX-currX%4,currY-currY%4,4,4);
			pixArr[currY-currY%4][currX-currX%4] = 1;
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