const readline = require('readline');
const crypto = require('crypto');
const { Table } = require('console-table-printer');

// Class for generating cryptographically secure keys
class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');  // 256-bit key
  }
}

// Class for generating HMAC using SHA-256
class HMACGenerator {
  static generateHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }
}

// Class to handle move calculation
class MoveCalculator {
  constructor(moves) {
    this.moves = moves;
  }

  getRandomMove() {
    const randomIndex = crypto.randomInt(0, this.moves.length);
    return this.moves[randomIndex];
  }

  getWinner(userMove, computerMove) {
    const userIndex = this.moves.indexOf(userMove);
    const compIndex = this.moves.indexOf(computerMove);
    const half = Math.floor(this.moves.length / 2);

    if (userIndex === compIndex) return 'Draw';

    // Circular logic to determine winner
    if ((compIndex > userIndex && compIndex <= userIndex + half) ||
        (compIndex < userIndex && userIndex - compIndex > half)) {
      return 'Computer Wins';
    } else {
      return 'User Wins';
    }
  }
}

// Class for displaying help table
class HelpTable {
  constructor(moves) {
    this.moves = moves;
  }

  displayTable() {
    const table = new Table({
      columns: [{ name: 'Move/PC', alignment: 'left' }, ...this.moves.map(move => ({ name: move }))],
    });

    this.moves.forEach((move, i) => {
      const row = {};
      row['Move/PC'] = move;
      this.moves.forEach((moveCompare, j) => {
        if (i === j) {
          row[moveCompare] = 'Draw';
        } else {
          const calc = new MoveCalculator(this.moves);
          row[moveCompare] = calc.getWinner(moveCompare, move).includes('User') ? 'Win' : 'Lose';
        }
      });
      table.addRow(row);
    });

    table.printTable();
  }
}

// Function to validate command-line arguments
function validateArgs(args) {
  if (args.length < 3 || args.length % 2 === 0) {
    console.log('Error: You must provide an odd number (≥ 3) of non-repeating moves.');
    console.log('Example: rock paper scissors');
    process.exit(1);
  }

  if (new Set(args).size !== args.length) {
    console.error("Error: Moves must be unique.");
    console.error("Example: rock paper scissors (you can't repeat moves like 'rock rock scissors')");
    process.exit(1);
  }
    // Check for duplicate moves
    if (new Set(args).size !== args.length) {
      console.log('Error: Moves must be unique.');
      console.log('Example: rock paper scissors pen eraser');
      return;
    }

}

// Function to handle user input using readline
function askQuestion(query, rl) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main function
async function main() {
  const moves = process.argv.slice(2);
  validateArgs(moves);

  const key = KeyGenerator.generateKey();
  const moveCalculator = new MoveCalculator(moves);
  const computerMove = moveCalculator.getRandomMove();
  const hmac = HMACGenerator.generateHMAC(key, computerMove);

  console.log(`HMAC: ${hmac}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    console.log("\nAvailable moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - Exit\n? - Help");

    const userInput = await askQuestion("Enter your move: ", rl);

    if (userInput === '?') {
      const helpTable = new HelpTable(moves);
      helpTable.displayTable();
      continue;
    } else if (userInput === '0') {
      console.log("Exiting the game.");
      rl.close();
      break;
    }

    const userMoveIndex = parseInt(userInput) - 1;
    if (isNaN(userMoveIndex) || userMoveIndex < 0 || userMoveIndex >= moves.length) {
      console.log('Error: Invalid move! Please enter a valid number corresponding to a move.');
      console.log('Example: Enter 1 for "rock", 2 for "paper", etc.');
      continue;
    }

    const userMove = moves[userMoveIndex];
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);

    const result = moveCalculator.getWinner(userMove, computerMove);
    console.log(`${result}!`);

    console.log(`HMAC key: ${key}`);
    console.log("Check the HMAC key to verify the integrity of the game.");
    console.log("https://www.freeformatter.com/hmac-generator.html");
    rl.close();
    break;
  }
}


// Run the main function
main();