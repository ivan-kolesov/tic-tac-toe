import React, { Component } from 'react';
import TicTacToe from './TicTacToeAgent';
import Board from './Board';
import { View } from 'react-native';
import { USER_FIGURE, AI_FIGURE, EMPTY, DRAW, BOARD_SIZE } from './constants';
import { getWinConditions } from './winConditions';

export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      board: Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY),
    };
  }

  _populateTile(index, figure, onFinish = f => f) {
    if (this.state.board[index] !== EMPTY) {
      return;
    }

    const board = [...this.state.board];
    board[index] = figure;

    this.setState(
      {
        board,
      },
      () => {
        const result = this._judgeWinner();

        if (result !== null) {
          this.props.onFinish(result);
        }

        onFinish();
      },
    );
  }

  _AIAct() {
    const input = this.state.board.join('');
    const model = new TicTacToe(input, AI_FIGURE);
    const recommendation = model.getRecommendation();

    this._populateTile(recommendation.index, AI_FIGURE);
  }

  _judgeWinner() {
    if (!this.state.board.some(figure => figure === EMPTY)) {
      return DRAW;
    }

    let winner = null;
    for (let i = 0; i < getWinConditions().length; ++i) {
      let figure = this.state.board[getWinConditions()[i][0]];

      if (getWinConditions()[i].every(tile => this._checkTile(tile, figure))) {
        winner = figure;
        break;
      }
    }

    return winner;
  }

  _checkTile(tile, figure) {
    return (
      this.state.board[tile] === figure && this.state.board[tile] !== EMPTY
    );
  }

  _handlePress = index => {
    this._populateTile(index, USER_FIGURE, () => this._AIAct());
  };

  render() {
    return (
      <View>
        <Board board={this.state.board} onPress={this._handlePress} />
      </View>
    );
  }
}
