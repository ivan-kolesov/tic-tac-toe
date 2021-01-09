import { BOARD_SIZE } from './constants';

let winConditions;

const getWinConditions = () => {
  if (winConditions === undefined) {
    winConditions = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      let conditions = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        conditions.push(i * BOARD_SIZE + j);
      }
      winConditions.push(conditions);
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
      let conditions = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        conditions.push(i + j * BOARD_SIZE);
      }
      winConditions.push(conditions);
    }

    let conditions = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      conditions.push(i * BOARD_SIZE + i);
    }
    winConditions.push(conditions);

    conditions = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      conditions.push(i * BOARD_SIZE + (BOARD_SIZE - i - 1));
    }
    winConditions.push(conditions);
  }

  return winConditions;
};

export { getWinConditions };
