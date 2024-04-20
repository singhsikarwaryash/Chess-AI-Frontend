import React from "react";
import {createComponent } from "@lit/react"
import {GChessBoardElement} from "gchessboard"
import { Chess } from "chess.js";
import generateAIMove from "../Utility/MoveGenerator.js";
import BoardStateManager from "../Utility/BoardStateManager.js";
import PawnPromotion from "./PawnPromotion.js";
import "./Styles/PlayArea.css";
export default class PlayArea extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    if (props.fen === "new") {
      let board = new Chess()
      this.boardState = new BoardStateManager(board.fen())
      this.state = {
        board: board,
        side: Math.random() < 0.5 ? "white" : "black",
        dim: this.getDim(),
        selectedPromotion: "q",
      };
    } else {
      this.boardState = new BoardStateManager(props.fen, false)
      this.state = {
        board: new Chess(this.boardState.getCurrState()),
        side: props.fen.split("_")[5],
        dim: this.getDim(),
        selectedPromotion: "q",
      };
    }
    this.GChessBoard = createComponent({
      react: React,
      tagName: "g-chess-board",
      elementClass: GChessBoardElement,
      events: {
        onMoveStart: "movestart",
        onMoveEnd: "moveend",
        onMoveCancel: "movecancel",
        onMoveFinished: "movefinished",
      },
    })
  }

  componentDidMount() {
    //console.log("Game Launched with Players side - " + this.state.side);
    const { board, side } = this.state;
    window.addEventListener("resize", () => {
      this.setState({
        dim: this.getDim(),
      });
    });
    if (board.turn() !== side[0]) {
      generateAIMove(board, this.boardState, this.setStateFromOtherModule);
    }
  }
  handleMoveStart = (e) => {
    e.detail.setTargets( 
      this.state.board.moves({ square: e.detail.from, verbose: true }).map((m) => m.to)
    )
  }
  handleSquareClick = (e) => {
    this.detail = e.detail;
    this.applyMove(e.detail);
    console.log(e.detail);
  };

  applyMove = (detail, promote = null) => {
    console.log(detail);
    const {board} = this.state;
    if (
      (parseInt(detail.to[1]) === 1 || parseInt(detail.to[1]) === 8) &&
      detail.piece.pieceType === "pawn"
    ) {
      if (promote) {
        try {
          board.move({
            from: detail.from,
            to: detail.to,
            promotion: promote
          });
          this.boardState.push(board.fen())
          if (!board.isGameOver()) {
            generateAIMove(board, this.boardState, this.setStateFromOtherModule);
          }
        } catch (error) {}
        this.setState({
          selectedPromotion: promote,
        });
      } else {
        this.setState({
          selectedPromotion: ""
        });
      }
    } else {
      try {
        board.move({
          from: detail.from,
          to: detail.to,
        });
        this.boardState.push(board.fen())
        this.setState({
          board : board
        })
        if (!board.isGameOver()) {
          generateAIMove(board, this.boardState, this.setStateFromOtherModule);
        }
      } catch (error) {
        console.log("Invalid move. Try again.");
      }
    }
  };

  getDim() {
    let height = window.innerHeight - 50 - 64;
    if (window.innerWidth > height) {
      return height * 0.85;
    }
    return window.innerWidth * 0.85;
  }
  setStateFromOtherModule = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  render() {
    const { board, side, dim, selectedPromotion } = this.state;
    return (
      <div className="play-area">
        <div id="board-area">
          {(() => {
            const style = {
              display: "inline-block",
              width: `${Math.round(dim)}px`,
            };
            if (board.isGameOver()) {
              if (board.isCheckmate()) {
                if (board.turn() === side[0]) {
                  return (
                    <div className="result" style={style}>
                      <p>You Lost the Game</p>
                    </div>
                  );
                } else {
                  return (
                    <div className="result" style={style}>
                      <p>You Won the Game</p>
                    </div>
                  );
                }
              } else {
                return (
                  <div className="result" style={style}>
                    <p>No One Won the Game</p>
                  </div>
                );
              }
            } else {
              return (
                  <this.GChessBoard
                    style = {{"width" : `${dim}px`, "height" : `${dim}px`}}
                    id = "board"
                    fen={board.fen()}
                    interactive = {!board.isGameOver()}
                    orientation = {side}
                    turn = {board.turn()==="w"? "white":"black"}
                    onMoveStart={this.handleMoveStart}
                    onMoveEnd={this.handleSquareClick}>
                </this.GChessBoard>
              );
            }
          })()}
        </div>
        {selectedPromotion === "" && (
          <PawnPromotion
            dim={dim}
            detail={this.detail}
            applyMove={this.applyMove}
          />
        )}
        <div
          className="home-btn"
          onClick={() => {
            this.props.setPage("");
          }}
        >
          <p>Main Menu</p>
        </div>
      </div>
    );
  }
}
