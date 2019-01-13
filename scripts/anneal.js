var temprature = 0.1;
var ABSOLUTE_ZERO = 1e-4;
var COOLING_RATE = 0.999999;
var CITIES = 50;
var SOLUTION_NOT_CHANGED_STEPS = 100;
var current = [];
var bestSolution = [];
var bestSolutionCost = 0;
var timeRunning = 0;
var sameSolutionIterations = 0;
var solveInterval;

$(document).ready(function() {
    $("#btnSolve").click(function() {
        temperature = parseFloat($("#temperature").val());
        ABSOLUTE_ZERO = parseFloat($("#abszero").val());
        COOLING_RATE = parseFloat($("#coolrate").val());
        CITIES = parseInt($("#cities").val());
        SOLUTION_NOT_CHANGED_STEPS = parseInt($("#solutionGoodEnoughSteps").val());
        init();
    });
});

var tspCanvas = document.getElementById('tsp-canvas');
var tspContext = tspCanvas.getContext("2d");

let randomFloat = function(n) {
	return (Math.random() * n);
}

let randomInt = function(n) {
	return Math.floor(Math.random() * (n));
}

let randomInteger = function(a,b) {
	return Math.floor(Math.random() * (b - a) + a);
}

let deepCopy = function(array, to) {
	let i = array.length;
	while(i--) {
		to[i] = [array[i][0],array[i][1]];
	}
}

let getCost = function(route) {
	let cost = 0;
	for(var i = 0; i < CITIES - 1; i++) {
		cost += getDistance(route[i], route[i+1]);
	}
	cost += getDistance(route[0],route[CITIES-1]);
	return cost;
}

let getDistance = function(p1, p2) {
	delX = p1[0] - p2[0];
	delY = p1[1] - p2[1];
	return Math.sqrt((delX * delX) + (delY * delY));
}

let mutate2Opt = function(route, i, j) {
	let neighbourSolution = [];
	deepCopy(route, neighbourSolution);
	while(i != j) {
		let t = neighbourSolution[j];
		neighbourSolution[j] = neighbourSolution[i];
		neighbourSolution[i] = t;

		i = (i + 1) % CITIES;
		if (i == j) {
            break;
        }
            
		j = (j - 1 + CITIES) % CITIES;
	}
	return neighbourSolution;
}

let acceptanceProbability = function(currentSolutionCost, neighbourSolutionCost) {
	if(neighbourSolutionCost < currentSolutionCost) {
        return 1;
    }
        
	return Math.exp((currentSolutionCost - neighbourSolutionCost) / temperature);
}

let init = function() {
	for(var i = 0; i < CITIES; i++) {
		current[i] = [randomInteger(10, tspCanvas.width - 10), randomInteger(10, tspCanvas.height - 10)];
	}

	deepCopy(current, bestSolution);
	bestSolutionCost = getCost(bestSolution);
	solveInterval = setInterval(solve, 10);
}

let solve = function() {
	if(temperature > ABSOLUTE_ZERO) {
		let currentSolutionCost = getCost(current);
		let k = randomInt(CITIES);
        let l = (k + 1 + randomInt(CITIES - 2)) % CITIES;
        
		if(k > l) {
			let tmp = k;
			k = l;
			l = tmp;
        }
        
		let neighbourSolution = mutate2Opt(current, k, l);
        let neighbourSolutionCost = getCost(neighbourSolution);
        
		if(Math.random() < acceptanceProbability(currentSolutionCost, neighbourSolutionCost)) {
			deepCopy(neighbourSolution, current);
			currentSolutionCost = getCost(current);
        }
        
		if(currentSolutionCost < bestSolutionCost) {
			deepCopy(current, bestSolution);
			bestSolutionCost = currentSolutionCost;
            paint();
            sameSolutionIterations = 0;
        } else {
            sameSolutionIterations++;
            if (sameSolutionIterations > SOLUTION_NOT_CHANGED_STEPS) {
                clearInterval(solveInterval);
            }
        }
        
        temperature *= COOLING_RATE;
    }

    //$("#timeRunning").html(timeRunning++);
}

let paint = function() {
	tspContext.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
	// Cities
	for(var i = 0; i < CITIES; i++) {
		tspContext.beginPath();
		tspContext.arc(bestSolution[i][0], bestSolution[i][1], 4, 0, 2 * Math.PI);
		tspContext.fillStyle = "#0000ff";
		tspContext.strokeStyle = "#000";
		tspContext.closePath();
		tspContext.fill();
		tspContext.lineWidth=1;
		tspContext.stroke();
    }
    
	// Links
	tspContext.strokeStyle = "#ff0000";
	tspContext.lineWidth = 2;
	tspContext.moveTo(bestSolution[0][0], bestSolution[0][1]);
	for(var i=0; i < CITIES - 1; i++) {
		tspContext.lineTo(bestSolution[i+1][0], bestSolution[i+1][1]);
    }
    
	tspContext.lineTo(bestSolution[0][0], bestSolution[0][1]);
	tspContext.stroke();
	tspContext.closePath();
}
