let SCORES = [];
SCORES[0] = 0;
SCORES[1] = 1;

let NEXT_TURN_MULTIPLIER = 1;

let FIRST_GO_CORNER_PERCENTAGE = 0.7;

let MAX_INCEPTION_LEVEL = 1;

let SEARCHES = {
  X: /X/g,
  O: /O/g,
};
let size;

function scoreForCount(myCount, thierCount) {
  if (myCount > 0) {
    if (thierCount === 0) {
      return SCORES[myCount];
    }
  }
  if (thierCount > 0) {
    if (myCount === 0) {
      return -(SCORES[thierCount] * NEXT_TURN_MULTIPLIER);
    }
  }
  return 0;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function countMarks(line, mark) {
  let matches = line.match(SEARCHES[mark]);
  return matches ? matches.length : 0;
}

function recommendationFrom(possibilities) {
  if (!possibilities || possibilities.length === 0) {
    return null;
  }

  let recommendations = {
    score: NaN,
    options: [],
  };

  // Randomly pick at corner at start of game
  // FIRST_GO_CORNER_PERCENTAGE of the time
  //
  if (
    possibilities.length === size * size &&
    Math.random() < FIRST_GO_CORNER_PERCENTAGE
  ) {
    [0, 2, 6, 8].forEach(function(corner_index) {
      recommendations.options.push(possibilities[corner_index]);
    });
  } else {
    possibilities.forEach(function(spot) {
      if (isNaN(recommendations.score) || spot.score > recommendations.score) {
        recommendations.score = spot.score;
        recommendations.options = [spot];
      } else if (spot.score === recommendations.score) {
        recommendations.options.push(spot);
      }
    });
  }
  return sample(recommendations.options);
}

function TicTacToeModel(state, currentTurn) {
  this.state = state;
  this.currentTurn = currentTurn;
  this.inceptionLevel = typeof arguments[2] === 'number' ? arguments[2] : 0;
  size = Math.sqrt(state.length);

  let score = 81;
  for (let c = 2; c <= size; c++) {
    SCORES[c] = score;
    score = score * score;
  }
}

TicTacToeModel.prototype.currentPlayer = function() {
  return this.currentTurn;
};

TicTacToeModel.prototype.otherPlayer = function() {
  return this.currentPlayer() === 'X' ? 'O' : 'X';
};

TicTacToeModel.prototype.imagineStateIfIPlay = function(index) {
  return (
    this.state.substr(0, index) +
    this.currentPlayer() +
    this.state.substr(index + 1)
  );
};

TicTacToeModel.prototype.imagineRecommendedMoveScore = function() {
  let recommendation = this.getRecommendation();
  let recommendedState = this.imagineStateIfIPlay(recommendation.index);
  return (
    this.imagineScore(recommendedState, this.otherPlayer()) /
    this.inceptionLevel
  );
};

TicTacToeModel.prototype.imagineScore = function(imaginedState, nextTurn) {
  let imaginedBoard = new TicTacToeModel(
    imaginedState,
    nextTurn,
    this.inceptionLevel + 1,
  );

  let summary = imaginedBoard.boardSummary();

  if (summary.complete) {
    return -summary.score;
  } else if (this.inceptionLevel < MAX_INCEPTION_LEVEL) {
    return -imaginedBoard.imagineRecommendedMoveScore();
  } else {
    return -summary.score;
  }
};

TicTacToeModel.prototype.possibilities = function() {
  let spots = this.state.split('');

  let that = this;

  return spots
    .map(function(spot, index) {
      let score = NaN;
      if (spot === '-') {
        let imaginedState = that.imagineStateIfIPlay(index);
        score = that.imagineScore(imaginedState, that.otherPlayer());
      }

      return {
        index: index,
        spot: spot,
        score: score,
      };
    })
    .filter(function(spot) {
      return !isNaN(spot.score);
    });
};

TicTacToeModel.prototype.lines = function() {
  let me = this.currentPlayer();
  let them = this.otherPlayer();

  let sources = [this.diagonal1(), this.diagonal2()];
  for (let c = 0; c < size; c++) {
    sources.push(this.row(c));
    sources.push(this.col(c));
  }
  return sources
    .map(function(line) {
      let myCount = countMarks(line, me);
      let thierCount = countMarks(line, them);
      return {
        line: line,
        mine: myCount,
        thiers: thierCount,
      };
    })
    .map(function(lineSummary) {
      lineSummary.score = scoreForCount(lineSummary.mine, lineSummary.thiers);
      return lineSummary;
    });
};

TicTacToeModel.prototype.winnerInfo = function(lines) {
  let me = this.currentPlayer();
  let them = this.otherPlayer();

  return lines.reduce(function(winner, line, index) {
    if (winner) {
      return winner;
    }

    if (line.mine === 3) {
      return {
        winner: me,
        line: index,
      };
    } else if (line.thiers === 3) {
      return {
        winner: them,
        line: index,
      };
    } else {
      return null;
    }
  }, null);
};

TicTacToeModel.prototype.boardSummary = function() {
  let l = this.lines();
  let c = this.winnerInfo(l);

  let scoreFromLines = l.reduce(function(memo, line) {
    return memo + line.score;
  }, 0);

  let scoreFromTraps = 0;

  let s = scoreFromLines + scoreFromTraps;
  return {
    complete: c,
    lines: l,
    score: s,
  };
};

TicTacToeModel.prototype.getRecommendation = function() {
  let p = this.possibilities();
  let r = recommendationFrom(p);

  let result = {
    possibilities: p,
  };
  if (r) {
    result.index = r.index;
    result.score = r.score;
  }

  return result;
};

TicTacToeModel.prototype.row = function(i) {
  return this.state.slice(i * size, i * size + size);
};

TicTacToeModel.prototype.col = function(i) {
  let str = '';
  for (let c = 0; c < size; c++) {
    str = str.concat(this.state.charAt(i + c * size));
  }
  return str;
};

TicTacToeModel.prototype.diagonal1 = function() {
  let str = '';
  for (let c = 0; c < size; c++) {
    str = str.concat(this.state.charAt(c * size + c));
  }
  return str;
};

TicTacToeModel.prototype.diagonal2 = function() {
  let str = '';
  for (let c = 0; c < size; c++) {
    str = str.concat(this.state.charAt(c * size + (size - c - 1)));
  }
  return str;
};

module.exports = TicTacToeModel;
