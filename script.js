//zmienne globalne
var canvas;
var ctx;
let gameWidth;
let colorBackground = "#333";
let players = [];
let paddels = [];
let balls = [];
let collisionObjects = [];
let timer;
let timerTime;
let time = 0;

let paddelsSpeed = 10;
let paddelsHeight = 100;
let paddelsWidth = 20;
let paddelsNumberOfSpeedLevels = 10;
let ballsSpeedMax = 8;
let ballsSpeedChange = 4;
let addBallTime = 10;
let pktWin = 20;
let computerLevel = 1;

let pause = false;
let pauseBlock = true;
let activeEnter = true;

//obiekt przechowujacy wartosci domyslne ustawien
const defaultSettings = new DefaultSettingsFunction();

//po uruchomieniu strony wykonaj: 
window.addEventListener("load", function () {
	//uchwyt do canvas
    canvas = document.getElementById('game');
    // Sprawdź, czy przeglądarka obsługuje element Canvas
    if (!canvas.getContext) return; 
	ctx = canvas.getContext('2d');
	canvas.width = 1000;
	canvas.height = 500;
	gameWidth = canvas.width;

	ctx.fillStyle = "green";
	ctx.font = "48px serif";
	ctx.fillText("Witaj w grze Pong!", 300, 70);
	ctx.fillStyle = "white";
	ctx.font = "24px serif";
	ctx.fillText("Naciśnij ENTER, aby rozpocząć nową grę.", 280, 150);
	ctx.fillText("W trakcie gry naciśnij SPACJE, aby zapauzować.", 245, 180);
	ctx.fillText("Użyj klawiszy 'w' i 's', aby sterować lewą paletką,", 245, 240);
	ctx.fillText("a strzałki w górę i w dół, aby sterować prawą paletką.", 235, 270);
	ctx.fillText("Opcje multiplayer znajdziesz w ustawieniach.", 260, 300);
	ctx.fillText("Zobywasz punkt za każdą piłkę, która poleci za paletkę przeciwnika.", 160, 330);
	ctx.fillText("Wygrywa ten, kto jako pierwszy zdobędzie określoną liczbę punktów.", 158, 360);
	ctx.fillText("Powodzenia!", 435, 410);
	//inicjalizacja gry
	//init();
	// Nasłuchiwanie  klawiatury 
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	// Nasłuchiwanie  myszki
	//document.addEventListener("mousemove", Follow, false);
	//document.addEventListener("mousedown", Fire, false);
}, false);

const newGame = () => {
	players = [];
	paddels = [];
	balls = [];
	collisionObjects = [];
	time = 0;

	pause = false;
	pauseBlock = false;
	activeEnter = false;

	clearInterval(timer);
	clearInterval(timerTime);

	init();
}

const init = () => {
	//ustawianie woartosci wprowadzonych przez uzytkownika
	//userSettings.setSettings();

	//tworzenie poczatkowych obiektow
	players.push(new Player("Player 1", 0, 0, 1), new Player("Komputer", 1, computerLevel, 2));

	paddels.push(new Paddel(paddelsWidth, paddelsHeight, "green", "black", 10, (canvas.height - paddelsHeight) / 2, paddelsSpeed),
		new Paddel(paddelsWidth, paddelsHeight, "blue", "black", canvas.width - 30, (canvas.height - paddelsHeight) / 2, paddelsSpeed));

	balls.push(newBall());

	//polaczenie kilku tablic elementow kolizyjnych w jedna
	collisionObjects = paddels.concat(balls);

	//odswierzenie wyswietlanych danych
	refreshDisplayData();

	//ustawienie odswierzania gry 60 razy na sekunde
	timer = setInterval(drawGameWorld, 1000 / 60);
	timerTime = setInterval(drawTime, 1000);
}

const keyDown = e => {
	switch(e.keyCode) {
		case 87/*w*/: if(players[0].computerLevel == 0) players[0].keyUp = true;
		break;
		case 83/*s*/: if(players[0].computerLevel == 0) players[0].keyDown = true;
		break;
		case 38/*strzalkwa w gore*/: if(players[1].computerLevel == 0) players[1].keyUp = true;
		break;
		case 40/*strzalka w dol*/: if(players[1].computerLevel == 0) players[1].keyDown = true;
		break;
		case 13/*enter*/: if(activeEnter) newGame();
		break;
		case 32/*spacja*/: gamePause();
		break;
	}
}

const keyUp = e => {
	switch(e.keyCode) {
		case 87/*w*/: if(players[0].computerLevel == 0) players[0].keyUp = false;
		break;
		case 83/*s*/: if(players[0].computerLevel == 0) players[0].keyDown = false;
		break;
		case 38/*strzalkwa w gore*/: if(players[1].computerLevel == 0) players[1].keyUp = false;
		break;
		case 40/*strzalka w dol*/: if(players[1].computerLevel == 0) players[1].keyDown = false;
		break;
	}
}

//konstruktor do tworzenia obiektu przechowujacego wartosci domyslne ustawien
function DefaultSettingsFunction() {
	this.paddelsSpeed = paddelsSpeed;
	this.paddelsHeight = paddelsHeight;
	this.paddelsWidth = paddelsWidth;
	this.ballsSpeedMax = ballsSpeedMax;
	this.ballsSpeedChange = ballsSpeedChange;
	this.addBallTime = addBallTime;
	this.pktWin = pktWin;
	this.computerLevel = computerLevel;

	this.setSettings = () => {
		paddelsSpeed = this.paddelsSpeed;
		paddelsHeight = this.paddelsHeight;
		paddelsWidth = this.paddelsWidth;
		ballsSpeedMax = this.ballsSpeedMax;
		ballsSpeedChange = this.ballsSpeedChange;
		addBallTime = this.addBallTime;
		pktWin = this.pktWin;
		computerLevel = this.computerLevel;
	}
}

function UserSettingsFunction() {
	this.paddelsSpeed = paddelsSpeed;
	this.paddelsHeight = paddelsHeight;
	this.paddelsWidth = paddelsWidth;
	this.ballsSpeedMax = ballsSpeedMax;
	this.ballsSpeedChange = ballsSpeedChange;
	this.addBallTime = addBallTime;
	this.pktWin = pktWin;
	this.computerLevel = computerLevel;

	this.setSettings = () => {
		paddelsSpeed = this.paddelsSpeed;
		paddelsHeight = this.paddelsHeight;
		paddelsWidth = this.paddelsWidth;
		ballsSpeedMax = this.ballsSpeedMax;
		ballsSpeedChange = this.ballsSpeedChange;
		addBallTime = this.addBallTime;
		pktWin = this.pktWin;
		computerLevel = this.computerLevel;
	}
}

//funkcja rysujaca wszystkie elementy gry
function drawGameWorld() {
	drawBackground();

	if(gameWidth != canvas.width)
		updateGameWindow();

	changeObjectsPosition();
	drawPaddels(paddels, ctx);
	drawBalls(balls, ctx);
	//drawBullets(ctx);

}

const changeObjectsPosition = () => {
	playersMove(players);
	ballsMove(balls);
}

const drawBackground = () => {
	/*/gradient liniowy
	var grd = ctx.createLinearGradient(canvas.width * (1/4), 100, canvas.width * (3/4), 0);
	grd.addColorStop(0, "#008800");
	grd.addColorStop(1, "#000088");
	*/
	ctx.fillStyle = colorBackground;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const drawTime = () => {
	++time;
	document.getElementById("time").innerHTML = time + " s";
	if(time % addBallTime == 0)
		balls.push(newBall());
}

const updateGameWindow = () => {
	paddels.forEach(paddel => {
		paddel.posX = canvas.width * (paddel.posX / gameWidth);
		paddel.width *= (canvas.width / gameWidth);
	});
	gameWidth = canvas.width;
}

const refreshDisplayData = () => {
	document.getElementById("namePlayer1").innerHTML = players[0].name;
	document.getElementById("scorePlayer1").innerHTML = players[0].points + " pkt";
	document.getElementById("time").innerHTML = time + " s";
	document.getElementById("namePlayer2").innerHTML = players[1].name;
	document.getElementById("scorePlayer2").innerHTML = players[1].points + " pkt";
}

const gamePause = () => {
	if(!pauseBlock)
	{
		pauseBlock = true;
		setTimeout(setPauseBlock, 100);
		if(pause) {
			pause = false;
			timer = setInterval(drawGameWorld, 1000 / 60);
			timerTime = setInterval(drawTime, 1000);
		}
		else {
			clearInterval(timer);
			clearInterval(timerTime);
	
			ctx.fillStyle = "white";
			ctx.font = "bold 60px serif";
			ctx.fillText("Pauza", 410, 70);
			ctx.fillStyle = "white";
			ctx.font = "24px serif";
			ctx.fillText("Naciśnij ENTER, aby rozpocząć nową grę.", 280, 150);
			ctx.fillText("W trakcie gry naciśnij SPACJE, aby zapauzować.", 245, 180);
			ctx.fillText("Użyj klawiszy 'w' i 's', aby sterować lewą paletką,", 245, 240);
			ctx.fillText("a strzałki w górę i w dół, aby sterować prawą paletką.", 235, 270);
			ctx.fillText("Opcje multiplayer znajdziesz w ustawieniach.", 260, 300);
			ctx.fillText("Zobywasz punkt za każdą piłkę, która poleci za paletkę przeciwnika.", 160, 330);
			ctx.fillText("Wygrywa ten, kto jako pierwszy zdobędzie określoną liczbę punktów.", 158, 360);
	
			pause = true;
		}
	}
}

const setPauseBlock = () => {
	pauseBlock = false;
}


//funkcja tworzaca graczy
function Player(name, paddelNumber, computerLevel, scorePlace) {
	this.name = name;
	this.paddelNumber = paddelNumber;
	this.points = 0;
	this.computerLevel = computerLevel; //jesli poziom komputera wynosi 0, to kontrole nad paletka ma gracz
	this.scorePlace = scorePlace; //jesli wynosi 1 to wybierz miejsce pierwszego gracza na wynik, jesli 2 to drugiego
	this.keyUp = false;
	this.keyDown = false;

	this.drawScore = () => {
		document.getElementById("scorePlayer" + this.scorePlace).innerHTML = this.points + " pkt";
	}

	this.ai = () => {
		let centerPosX = paddels[this.paddelNumber].posX + paddels[this.paddelNumber].width / 2;
		let centerPosY = paddels[this.paddelNumber].posY + paddels[this.paddelNumber].height / 2;
		
		let nearestBall = balls[0];
		let ballIsComing = 0;
		for(let i = 0; i < balls.length; ++i)
			if((balls[i].speedX != 0 || balls[i].speedY != 0) //jesli pilka nie jest zamrozona
			&& (Math.abs(balls[i].posX + balls[i].speedX - centerPosX) < Math.abs(balls[i].posX - centerPosX)) //jesli pilka sie zbliza do paletki
			&& (Math.round(Math.abs((balls[i].posX - centerPosX) / balls[i].speedX)) <= Math.round(Math.abs((nearestBall.posX - centerPosX) / nearestBall.speedX)))) { //wybiera pilke ktorej zostalo najmniej kolejek do zrownania sie z paletka
				nearestBall = balls[i];
				ballIsComing = i + 1;
			}
				

		let paddelSMax = paddels[this.paddelNumber].speedMax; //maksymalna szybkosc paletki
		let speedAdd = Math.ceil((paddelSMax * this.computerLevel) / paddelsNumberOfSpeedLevels);
		if(speedAdd > paddelSMax)
			speedAdd = paddelSMax;

		let nearestBallFuturePosY = nearestBall.posY;
		if(nearestBall.speedX != 0)
		{
			//distanceToTravele na poczatku przy nearestBall.speedX < 0 sie zeruje, a przy nearestBall.speedX > 0 wynosi wysokosc canvas.height 
			let distanceToTravel = Math.abs(nearestBall.posY + Math.ceil(Math.abs((nearestBall.posX - centerPosX) / nearestBall.speedX)) * nearestBall.speedY);
			let numberChangeSign = Math.floor(distanceToTravel / canvas.height); 

			if(numberChangeSign % 2)
				nearestBallFuturePosY = canvas.height - (distanceToTravel % canvas.height);
			else
				nearestBallFuturePosY = distanceToTravel % canvas.height;
		}

		if(!ballIsComing)
			nearestBallFuturePosY = canvas.height / 2;

		let timeBrakingIfIncreasedSpeed = (Math.abs(paddels[this.paddelNumber].speed) + speedAdd) / speedAdd;
		let brakingDistanceIfIncreasedSpeed = (Math.abs(paddels[this.paddelNumber].speed) + speedAdd) * timeBrakingIfIncreasedSpeed - ((speedAdd * Math.pow(timeBrakingIfIncreasedSpeed, 2)) / 2);
		let maxBrakingDistance = paddelSMax * (paddelSMax / speedAdd) - ((speedAdd * Math.pow((paddelSMax / speedAdd), 2)) / 2);
		if(brakingDistanceIfIncreasedSpeed > maxBrakingDistance)
			brakingDistanceIfIncreasedSpeed = maxBrakingDistance;

		let sign = 1;
		if(centerPosY >= nearestBallFuturePosY)
			sign = -1;

		const distance = Math.abs(centerPosY - nearestBallFuturePosY);

		if(distance >= (brakingDistanceIfIncreasedSpeed + Math.abs(paddels[this.paddelNumber].speed) + speedAdd))
			paddels[this.paddelNumber].speed += speedAdd * sign;
		else if(distance <= speedAdd && Math.abs(paddels[this.paddelNumber].speed) <= speedAdd){
			paddels[this.paddelNumber].posY = nearestBallFuturePosY - paddels[this.paddelNumber].height / 2;
			paddels[this.paddelNumber].speed = 0;
		}
		else if(distance > speedAdd && Math.abs(paddels[this.paddelNumber].speed) <= speedAdd){
			paddels[this.paddelNumber].speed = speedAdd * sign;
		}
		else
			paddels[this.paddelNumber].speed -= speedAdd * sign;
	}
	
}

const playersMove = (players) => {
	players.forEach(player => {
		if(player.computerLevel)
			player.ai();

		if(player.keyUp)
			paddels[player.paddelNumber].moveUp();
		if(player.keyDown)
			paddels[player.paddelNumber].moveDown();

		if(Math.abs(paddels[player.paddelNumber].speed) > paddels[player.paddelNumber].speedMax) 
			paddels[player.paddelNumber].speed = paddels[player.paddelNumber].speedMax * Math.sign(paddels[player.paddelNumber].speed);
		paddels[player.paddelNumber].posY += paddels[player.paddelNumber].speed;

		if(paddels[player.paddelNumber].posY > canvas.height - paddels[player.paddelNumber].height) {
			paddels[player.paddelNumber].posY = canvas.height - paddels[player.paddelNumber].height;
			paddels[player.paddelNumber].speed = 0;
		}
		else if(paddels[player.paddelNumber].posY < 0) {
			paddels[player.paddelNumber].posY = 0;
			paddels[player.paddelNumber].speed = 0;
		}
	});
}

//funkcja tworzaca obiekt paletki
function Paddel(width, height, color, colorStroke, posX, posY, speedMax) {
	this.width = width;
	this.height = height;
	this.color = color;
	this.colorStroke = colorStroke;
	this.posX = posX;
	this.posY = posY;
	this.speedMax = speedMax; //maksymalna szybkosc paletki
	this.speed = 0; //aktualna szybkosc poruszania sie paletki
	

	this.moveUp = () => {
		this.speed -= this.speedMax / paddelsNumberOfSpeedLevels;
	}
	this.moveDown = () => {
		this.speed += this.speedMax / paddelsNumberOfSpeedLevels;
	}

}

//funkcja rysujaca paletki
const drawPaddels = (paddels, ctx) => {
	paddels.forEach(paddel => {
		//wypelnienie paletki kolorem
		ctx.fillStyle = paddel.color;
		ctx.fillRect(paddel.posX, paddel.posY, paddel.width, paddel.height);
		//obramowanie paletki
		ctx.lineWidth = 3;
		ctx.strokeStyle = paddel.colorStroke;
		ctx.strokeRect(paddel.posX, paddel.posY, paddel.width, paddel.height);
	});
}

//funkcja tworzaca obiekt pilki
function Ball(radius, color, colorStroke, posX, posY, speedX, speedY, speedMax) {
	this.radius = radius;
	this.color = color;
	this.colorStroke = colorStroke;
	this.posX = posX;
	this.posY = posY;
	this.speedX = speedX;
	this.speedY = speedY;
	this.speedMax = speedMax;

	this.move = () => {
		const left = this.posX - this.radius;
		const right = this.posX + this.radius;
		const top = this.posY - this.radius;
		const bottom = this.posY + this.radius;

		if(left < 0) {
			players[1].points++;
			players[1].drawScore();
			if(players[1].points >= pktWin)
				win(players[1]);
			this.resetBall();
			return;
		}
		else if(right > canvas.width) {
			players[0].points++;
			players[0].drawScore();
			if(players[0].points >= pktWin)
				win(players[0]);
			this.resetBall();
			return;
		}
		else {
			//polaczenie kilku tablic elementow kolizyjnych w jedna
			collisionObjects = paddels.concat(balls);

			for(let i = 0; i < collisionObjects.length; ++i) {
				if(this === collisionObjects[i])
					continue;

				let left2 = collisionObjects[i].posX;
				let right2 = collisionObjects[i].posX;
				let top2 = collisionObjects[i].posY;
				let bottom2 = collisionObjects[i].posY;


				//ustawienie szerokosci i dlugosci paletki
				if (typeof (collisionObjects[i].radius) === "undefined") {
					right2 += collisionObjects[i].width;
					bottom2 += collisionObjects[i].height;
				 }
				//ustawienie szerokosci i dlugosci pilki
				else {
					left2 -= collisionObjects[i].radius;
					right2 += collisionObjects[i].radius;
					top2 -= collisionObjects[i].radius;
					bottom2 += collisionObjects[i].radius;
				}

				//jesli zawiera sie w innym obiekcie
				if(((left2 <= left && left <= right2 ) || (left2 <= right && right <= right2 )) && ((top2 <= top && top <= bottom2) || (top2 <= bottom && bottom <= bottom2))
				|| ((left2 <= left + this.speedX && left + this.speedX <= right2 ) || (left2 <= right + this.speedX && right + this.speedX <= right2 )) && ((top2 <= top + this.speedY && top + this.speedY <= bottom2) || (top2 <= bottom + this.speedY && bottom + this.speedY <= bottom2))) {
					if (typeof (collisionObjects[i].speedX) === "undefined") { //przypadek jesli obiektem jest paletka
						if(this.posX > (collisionObjects[i].posX + collisionObjects[i].width / 2)) //jesli srodek pilki jest po prawo od srodka paletki
							this.speedX = Math.abs(speedRandomChange(this.speedX, ballsSpeedChange)); //ustaw kierunek lotu pilki, tak aby leciala w prawo
						else if(this.posX < (collisionObjects[i].posX + collisionObjects[i].width / 2)) //jesli srodek pilki jest po lewo od srodka paletki
							this.speedX = -Math.abs(speedRandomChange(this.speedX, ballsSpeedChange)); //ustaw kierunek lotu pilki, tak aby leciala w lewo
						else
							this.speedX = speedRandomChangeVariableSign(this.speedX, ballsSpeedChange);
					}
					else {
						if(this.posX > collisionObjects[i].posX)
							this.speedX = Math.abs(speedRandomChange(this.speedX, ballsSpeedChange));
						else if(this.posX < collisionObjects[i].posX)
							this.speedX = -Math.abs(speedRandomChange(this.speedX, ballsSpeedChange));
						else
							this.speedX = speedRandomChangeVariableSign(this.speedX, ballsSpeedChange);

						this.speedY = speedRandomChangeVariableSign(this.speedY, ballsSpeedChange);
					}
					break;
				}
			}
		}

		
		if(top + this.speedY <= 0)
			this.speedY = Math.abs(speedRandomChange(this.speedY, ballsSpeedChange));
		else if(bottom + this.speedY >= canvas.height)
			this.speedY = -Math.abs(speedRandomChange(this.speedY, ballsSpeedChange));

		if(Math.abs(this.speedX) > this.speedMax)
			this.speedX = this.speedMax * Math.sign(this.speedX);
		if(Math.abs(this.speedY) > this.speedMax)
			this.speedY = this.speedMax  * Math.sign(this.speedY);
		this.posX += this.speedX;
		this.posY += this.speedY;
	}

	this.resetBall = () => {
		let buforBall = newBall();
		this.posX = buforBall.posX;
		this.posY = buforBall.posY;
		this.speedX = buforBall.speedX;
		this.speedY = buforBall.speedY;
	}
}

//funkcja rysujaca pilki
const drawBalls = (balls, ctx) => {
	balls.forEach(ball => {
		//tworzenie obramowania pilki
		ctx.beginPath();
		ctx.arc(ball.posX, ball.posY, ball.radius, Math.PI*2, false);
		//wypelnianie kolorem obramowania pilki
		ctx.lineWidth = 2;
		ctx.strokeStyle = ball.colorStroke;
		ctx.stroke(); //rysuje linie zgodnie z wyznaczonymi wczesniej sciezkami
		//wypelnianie kolorem wnetrza pilki
		ctx.fillStyle = ball.color;
		ctx.fill();
		ctx.closePath();
	});
}

const newBall = () => {
	return new Ball(12, randomColor(), "white", canvas.width/2, canvas.height/2, speedRandomChangeVariableSign(2, ballsSpeedChange), speedRandomChangeVariableSign(2, ballsSpeedChange), ballsSpeedMax);
}

const ballsMove = balls => {
	balls.forEach(ball => {
		ball.move();
	});
}

const randomColor = () => {
	let rgbColors = [];
	let returnColor = "#";

	for(i = 0; i < 3; ++i) {
		rgbColors[i] = Math.floor(Math.random() * 256).toString(16);
		if(rgbColors[i].length < 2)
			rgbColors[i] = "0" + rgbColors[i];
		returnColor += rgbColors[i];
	}

	return returnColor;
}

//zwraca losowo zwiekszona liczbe z tym samym znakiem
const speedRandomChange = (speed, changeLevel) => {
	let speedBuffer = Math.round(speed * ((Math.random() / 10) * changeLevel + 1) + Math.sign(speed) * changeLevel);
	if(speedBuffer == 0) {
		if(Math.round(Math.random()))
			speedBuffer = 1;
		else
			speedBuffer = -1;
	}
	return speedBuffer;
}

//zwraca losowo zwiekszona liczbe z losowym znakiem
const speedRandomChangeVariableSign = (speed, changeLevel) => {
	let speedBuffer = Math.round((speed * ((Math.random() / 10) * changeLevel + 1) + Math.sign(speed) * changeLevel) * Math.sign(Math.random() - 0.5));
	if(speedBuffer == 0) {
		if(Math.round(Math.random()))
			speedBuffer = 1;
		else
			speedBuffer = -1;
	}
	return speedBuffer;
}

const win = (player) => {
	clearInterval(timer);
	clearInterval(timerTime);

	ctx.fillStyle = "green";
	ctx.font = "48px serif";
	ctx.fillText("Wygrał " + player.name + "!", 300, 70);
	ctx.fillStyle = "white";
	ctx.font = "24px serif";
	ctx.fillText("Naciśnij ENTER, aby rozpocząć nową grę.", 280, 150);

	activeEnter = true;
	pauseBlock = true;
} 

const gameSettings = () => {
	alert("Menu ustawień nie zostało jeszcze dodane. Ustawienia można zmienić edytując domyślne wartości zmiennych znajdujące się w początkowych liniach kodu pliku \"script.js\".")
}