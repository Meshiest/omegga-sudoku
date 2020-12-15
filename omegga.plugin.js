const {chat: { sanitize }} = OMEGGA_UTIL;
const CooldownProvider = require('./util.cooldown.js');
const fontParser = require('./util.fontParser.js');

const font = fontParser(__dirname  + '/font.brs');

// sudoku generator library
const Sudoku = require('./lib.sudoku.js');
const DIFFICULTIES = ['easy', 'medium', 'hard', 'very hard'];

class SudokuPlugin {
  constructor(omegga, config) {
    this.config = config;
    this.omegga = omegga;
    this.cooldown = CooldownProvider(5000);
  }

  init() {
    this.omegga.on('chatcmd:sudoku', this.cmdSudoku.bind(this));
  }

  stop() {
    this.omegga.removeAllListeners('chatcmd:sudoku');
  }

  toOne(name, ...messages) {
    // TODO: maybe make this broadcast if in A4
    if (this.omegga.version === 'a4')
      this.omegga.broadcast(...messages);
    else
      this.omegga.whisper(name, ...messages);
  }

  async cmdSudoku(name, ...args) {
    if (
      this.config['host-only'] && !this.omegga.getPlayer(name).isHost() &&
      !this.config['authorized'].split(',').includes(name)
    ) return;

    if (!this.cooldown(name)) return;
    try {
      const player = this.omegga.getPlayer(name);
      let [x, y, z] = await player.getPosition();

      // snap coords to grid
      x = Math.round(x/10)*10+5;
      y = Math.round(y/10)*10+5;
      z = Math.round(z/4)*4;

      // generate a sudoku
      const generatedSudoku = Sudoku(DIFFICULTIES.includes(args.join(' ')) ? args.join(' ') : 'medium');

      // get the board and analysis
      const analysis = generatedSudoku.analyzeBoard();
      const sudokuBoard = generatedSudoku.getBoard();


      const chars = [];
      for (let i = 0; i < 9; i++) {
        // build red numbers off to the side
        chars.push({
          char: (1 + i) + '',
          pos: [-1 * 7 * 10, i * 7 * 10, -4],
          color: [255, 0, 0, 255],
        });

        // render the sudoku in a 7x7 plate grid
        for (let j = 0; j < 9; j++) {
          if(typeof sudokuBoard[j * 9 + i].val === 'number') {
            chars.push({
              char: sudokuBoard[j * 9 + i].val + ' ',
              pos: [i * 7 * 10, j * 7 * 10, 0],
              color: [0, 0, 0, 255],
            });
          }
        }
      }

      // generate alternating colored plates underneath each subgrid
      let grid = [];
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          grid.push({
            asset: 'PB_DefaultTile',
            position: [(7 * 3 * i + 7) * 10, (7 * 3 * j + 7) * 10 + 10, 0],
            size: [7 * 3 * 5, 7 * 3 * 5, 2],
            color: (i + j * 3) % 2 ? [255, 255, 255, 255] : [150, 150, 150, 255],
          });

      // write the save
      this.omegga.loadSaveData(font.grid(chars, {
        shift: [x, y, z - 22],
        author: {
          id: player.id,
          name,
        },
        bricks: grid,
      }), {quiet: true});
      this.toOne(name, `"Generated <b>${sanitize(name)}</> a sudoku: ${analysis.level} (${analysis.score})"`)
    } catch (e) {
      console.log(e);
      this.toOne(name, `"Could not find ${sanitize(name)}"`);
    }
  }
}

module.exports = SudokuPlugin;