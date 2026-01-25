let maze = document.querySelector('.maze');
let body = document.querySelector('.body');
let ctx = maze.getContext('2d');

let player;
let playerX = 0;
let playerY = 0;
const playerSize = 32;

let current;

let canMove = false;

class Maze {
    constructor(size, rows, columns) {
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.stack = [];
    }

    setup() {
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.columns; c++) {
                let cell = new Cell(r, c, this.grid, this.size);
                row.push(cell);
            }
            this.grid.push(row)
        }
        current = this.grid[0][0]
    }

    draw() {
        maze.width = this.size;
        maze.height = this.size;
        maze.style.background = "black";
        current.visited = true;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                let grid = this.grid;
                grid[r][c].show(this.size, this.rows, this.columns);
            }
        }

        let next = current.checkNeighbours();

        if (next) {
            next.visited = true;

            this.stack.push(current);

            current.highlight(this.columns);

            current.removeWalls(current, next);

            current = next;
        } else if (this.stack.length > 0) {
            let cell = this.stack.pop();
            current = cell;
            current.highlight(this.columns);
        }

        if (this.stack.length == 0) {
            
            current.undoHighlight(this.columns);
            canMove = true;
            
            const exitCell = this.grid[this.rows - 1][this.columns - 1];
            exitCell.walls.rightWall = false;
            exitCell.show(this.size, this.rows, this.columns);
            ctx.fillStyle = "green";
            ctx.fillRect(
                exitCell.colNum * this.size / this.columns + 1,
                exitCell.rowNum * this.size / this.rows + 1,
                this.size / this.columns - 2,
                this.size / this.rows - 2
            );

            spawnPlayer(playerX, playerY);
            return;
        }

        window.requestAnimationFrame(() => {
            this.draw();
        })
    }
}

class Cell {
    constructor(rowNum, colNum, parentGrid, parentSize, className) { 
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.parentGrid = parentGrid;
        this.parentSize = parentSize;
        this.visited = false;
        this.walls = {
            topWall : true,
            rightWall : true,
            bottomWall : true,
            leftWall : true,
        };
        this.className = 'cell';
    }

    checkNeighbours() {
        let grid = this.parentGrid;
        let row = this.rowNum;
        let col = this.colNum;
        let neighbours  = [];

        let top = row !== 0 ? grid[row - 1][col] : undefined;
        let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
        let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
        let left = col !== 0 ? grid[row][col - 1] : undefined;

        if (top && !top.visited) neighbours.push(top);
        if (right && !right.visited) neighbours.push(right);
        if (bottom && !bottom.visited) neighbours.push(bottom);
        if (left && !left.visited) neighbours.push(left);

        if (neighbours.length !== 0) {
            let random = Math.floor(Math.random() * neighbours.length);
            return neighbours[random];
        } else {
            return undefined;
        }
    }

    drawTopWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size / columns, y);
        ctx.stroke();
    }

    drawRightWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x + size / columns, y);
        ctx.lineTo(x + size / columns, y + size / rows);
        ctx.stroke();
    }

    drawBottomWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y + size / rows);
        ctx.lineTo(x + size / columns, y + size / rows);
        ctx.stroke();
    }

    drawLeftWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + size / rows);
        ctx.stroke();
    }

    highlight(columns) {
        let x = this.colNum * this.parentSize / columns + 1;
        let y = this.rowNum * this.parentSize / columns + 1;

        ctx.fillStyle = 'purple';
        ctx.fillRect(x, y, this.parentSize / columns - 3, this.parentSize / columns - 3)
    }

    undoHighlight(columns) {
        let x = this.colNum * this.parentSize / columns + 1;
        let y = this.rowNum * this.parentSize / columns + 1;

        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, this.parentSize / columns - 3, this.parentSize / columns - 3)
    }

    removeWalls(cell1, cell2) {
        
        let x = (cell1.colNum - cell2.colNum);

        if (x == 1) {
            cell1.walls.leftWall = false;
            cell2.walls.rightWall = false;
        } else if (x == -1) {
            cell1.walls.rightWall = false;
            cell2.walls.leftWall = false;
        }

        let y = (cell1.rowNum - cell2.rowNum)

        if (y == 1) {
            cell1.walls.topWall = false;
            cell2.walls.bottomWall = false;
        } else if (y == -1) {
            cell1.walls.bottomWall = false;
            cell2.walls.topWall = false;
        }
    }

    show(size, rows, columns) {

        let x = (this.colNum * size) / columns;
        let y = (this.rowNum * size) / rows;

        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;

        if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
        if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
        if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
        if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
        if (this.visited) {
            ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
        }
    }
}

let newMaze = new Maze(640, 20, 20);
newMaze.setup()
newMaze.draw()

document.addEventListener("keydown", handleKey);

const directions = ['up', 'down', 'left', 'right'];

// const keyboardValues = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];


const keyboardValues = ['w', 'a', 's', 'd'];
const randomKeyMappings = {};

directions.forEach(direction => {
    const randomKey = keyboardValues[Math.floor(Math.random() * keyboardValues.length)];
    
    const index = keyboardValues.indexOf(randomKey);
    if (index > -1) { 
    keyboardValues.splice(index, 1);
}
    const propertyName = direction
    randomKeyMappings[propertyName] = {
        key: randomKey,
        direction: direction
    };
});

console.log("move up:", randomKeyMappings['up'].key)
console.log("move down:", randomKeyMappings['down'].key)
console.log("move left:", randomKeyMappings['left'].key)
console.log("move right:", randomKeyMappings['right'].key)
// for (let i = 0; i < 4; i++) {
//     const randomKey = keyboardValues[Math.floor(Math.random() * keyboardValues.length)];
//     // const randomDirection = directions[Math.floor(Math.random() * directions.length)];
//     const propertyName = `input_${i}`;

//     dynamicKeyMappings[propertyName] = {
//         key: randomKey,
//         direction: randomDirection
//     };
// }

// function pickKeys() {
//     var keyOptions = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
//     var keyOptionsNum = keyOptions.length;
//     var directions = ['up', 'down', 'left', 'right'];
//     var directionsNum = directions.length;

    
//     for (var direction = 0; direction < directionsNum; direction++) {
//         randomKeyInt = Math.floor(Math.random() * keyOptions.length);
//         let randomKey = keyOptions[randomKeyInt];
        

        
//     }
// }

function handleKey(e) {
    if (canMove == true) {
        if (e.key == randomKeyMappings['up'].key) {
            movePlayer("up");
        }
        if (e.key == randomKeyMappings['down'].key) {
            movePlayer("down");
        }
        if (e.key == randomKeyMappings['left'].key) {
            movePlayer("left");
        }
        if (e.key == randomKeyMappings['right'].key) {
            movePlayer("right");
        }
    }
    // if (canMove == true) {
    //     if (e.key == "w") {
    //         movePlayer("up");
    //     }
    //     if (e.key == "s") {
    //         movePlayer("down");
    //     }
    //     if (e.key == "a") {
    //         movePlayer("left");
    //     }
    //     if (e.key == "d") {
    //         movePlayer("right");
    //     }
    // }

}

const TILE = 32;

function movePlayer(direction) {
    let nextX = playerX;
    let nextY = playerY;

    switch (direction) {
        case 'up': nextY -= TILE; break;
        case 'down': nextY += TILE; break;
        case 'left': nextX -= TILE; break;
        case 'right': nextX += TILE; break;
    }

    if (!isTileBlocked(nextX, nextY, direction)) {
        playerX = nextX;
        playerY = nextY;
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }
    // console.log("trying to move", direction);
    // let nextX = playerX;
    // let nextY = playerY;

    // switch (direction) {
    //     case 'up': nextY -= TILE; break;
    //     case 'down': nextY += TILE; break;
    //     case 'left': nextX -= TILE; break;
    //     case 'right': nextX += TILE; break;
    // }

    // // if (true) {
    // if (!isTileBlocked(nextX, nextY)) {
    //     playerX = nextX;
    //     playerY = nextY;

    //     player.style.left = `${playerX}px`;
    //     player.style.top = `${playerY}px`;
    //     // player.style.transform = `translate(${playerX}px, ${playerY}px)`;
    // }

    // // let nextX = playerX;
    // // let nextY = playerY;
    // let validMove = false;

    // switch (direction) {
    //     case 'up': nextY--; break;
    //     case 'down': nextY++; break;
    //     case 'left': nextX--; break;
    //     case 'right': nextX++; break;
    //     default: return;
    // }

    // if (!isCollision(nextX, nextY)) {
    //     playerX = nextX;
    //     playerY = nextY;
    //     player.style.transform = `translate(${playerX}px, ${playerY}px)`
    // }

    
    // switch (direction) {
    //     case 'up':
    //         if (!isCollision(playerX, playerY - 32)) moveUp()
    //         break;
    //     case 'down':
    //         if (!isCollision(playerX, playerY + 32)) moveDown()
    //         break;
    //     case 'left':
    //         if (!isCollision(playerX - 32, playerY)) moveLeft()
    //         break;
    //     case 'right':
    //         if (!isCollision(playerX + 32, playerY)) moveRight()
    // };
}

function moveUp() {
    console.log("you can move up");
}

function moveDown() {
    console.log("you can move down");
}

function moveLeft() {
    console.log("you can move left");
}

function moveRight() {
    console.log("you can move right");
}

function spawnPlayer(x, y) {
    // const player = document.createElement('div');

    // player.classList.add('player');

    // player.style.left = x + 'px';
    // player.style.top = y + 'px';

    // document.getElementById('maze').appendChild(player);

    player = document.createElement('img');

    player.src = 'src/assets/images/burger.png';
    player.alt = "burger player";
    player.classList.add('player');

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
    player.style.zIndex = 1;

    body.appendChild(player);
}

function isCollision(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    const isPath = r > 240 && g > 240 && b > 240;

    return !isPath;
    
    // const pixelData = imageData.data;

    
    // const red = pixelData[0];
    // const green = pixelData[1];
    // const blue = pixelData[2];

    // const isWhite = (red === 255 && green === 255 && blue === 255);

    // if (isWhite) {
    //     return true;
    // } 
    // return false;
}

function isTileBlocked(tileX, tileY, direction) {
    const col = tileX / TILE;
    const row = tileY / TILE;

    if (row < 0 || row >= newMaze.rows || col < 0 || col >= newMaze.columns) return true;

    const cell = newMaze.grid[row][col];

    switch (direction) {
        case "up":
            return cell.walls.bottomWall;
        case "down":
            return cell.walls.topWall;
        case "left":
            return cell.walls.rightWall;
        case "right":
            return cell.walls.leftWall;
    }
    return true;
    // const rect = maze.getBoundingClientRect();

    // const startX = Math.floor(tileX - rect.left + 4);
    // const startY = Math.floor(tileY - rect.top + 4);
    // const width = TILE - 8;
    // const height = TILE - 8;
    // // const endX = startX + TILE - 8;
    // // const endY = startY + TILE - 8;

    // if (
    //     startX < 0 || startY < 0 ||
    //     startX + width >= maze.width || 
    //     startY + height >= maze.height
    // ) {
    //     return true;
    // }

    // const data = ctx.getImageData(startX, startY, width, height).data;

    // for (let i = 0; i < data.length; i += 4) {
    //     const r = data[i];
    //     const g = data[i + 1];
    //     const b = data[i + 2];

    //     if (r < 20 && g < 20 && b < 20) {
    //         return false;
    //     }
    // }
    // return true;

    // // if (cx < 0 || cy < 0 || cx >= maze.width || cy >= maze.height) {
    // //     return true;
    // // }
    // // // ctx.fillStyle = "red";
    // // // ctx.fillRect(cx, cy, 2, 2);
    // // const imageData = ctx.getImageData(cx, cy, 1, 1);
    // // const [r, g, b] = imageData.data;

    // // const isPath = r > 240 && g > 240 && b > 240;
    // // return !isPath;
}

let wait = document.querySelector('.wait');

setInterval(checkForCompletion, 1000);

function checkForCompletion() {
    if (canMove === true) {
        wait.remove();
    }
}