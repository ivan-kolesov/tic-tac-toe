import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import Tile from './Tile';
import { BOARD_SIZE } from './constants';

export default class Board extends Component {
  _renderRows() {
    const rows = [];

    for (let i = 0; i < BOARD_SIZE; ++i) {
      rows.push(
        <View key={i} style={styles.row}>
          {this._renderRow(i)}
        </View>,
      );
    }

    return rows;
  }

  _renderRow(number) {
    const tiles = [];
    const { board, onPress } = this.props;

    for (let i = 0; i < BOARD_SIZE; ++i) {
      const index = number * BOARD_SIZE + i;

      tiles.push(
        <Tile key={i} value={board[index]} index={index} onPress={onPress} />,
      );
    }

    return tiles;
  }

  render() {
    return <View style={styles.container}>{this._renderRows()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'darkgrey',
    borderColor: '#fff',
    borderWidth: 1,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
