import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchOneGame, fetchPlayers } from '../actions/games/fetch'
import { connect as subscribeToWebsocket } from '../actions/websocket'
import JoinGameDialog from '../components/games/JoinGameDialog'
import Tile from '../components/games/Tile'
import './Game.css'
import changeTile from '../actions/games/changeTile'

const playerShape = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  pairs: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string
})

class Game extends PureComponent {
  static propTypes = {
    fetchOneGame: PropTypes.func.isRequired,
    fetchPlayers: PropTypes.func.isRequired,
    subscribeToWebsocket: PropTypes.func.isRequired,
    game: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      players: PropTypes.arrayOf(playerShape),
      draw: PropTypes.bool,
      updatedAt: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      started: PropTypes.bool,
      winner: PropTypes.bool,
      winnerName: PropTypes.string,
      winnerId: PropTypes.string,
      turn: PropTypes.number.isRequired,
      board: PropTypes.arrayOf(PropTypes.string),
      tile: PropTypes.arrayOf(PropTypes.shape({
        symbol: PropTypes.string,
        _id: PropTypes.string,
        index: PropTypes.number
      }))
    }),
    currentPlayer: playerShape,
    isPlayer: PropTypes.bool,
    isJoinable: PropTypes.bool,
    hasTurn: PropTypes.bool
  }

  componentWillMount() {
    const { game, fetchOneGame, subscribeToWebsocket } = this.props
    const { gameId } = this.props.match.params

    if (!game) { fetchOneGame(gameId) }
    subscribeToWebsocket()
  }

  componentWillReceiveProps(nextProps) {
    const { game } = nextProps

    if (game && !game.players[0].name) {
      this.props.fetchPlayers(game)
    }
  }

  clickTile = tile => () => {
    const { game } = this.props

    // console.log(tile.symbol)
    // console.log(game.turn)
    // console.log(game.winnerId)

    const players = this.props.game.players
    const currentPlayer = this.props.currentPlayer
    const turn = this.props.game.turn

    this.props.changeTile(tile, game, players, currentPlayer, turn )

  }

  renderTile = (tile, index) => {
    return <Tile
            key={index}
            gameId={this.props.match.params.gameId}
            onClick={this.clickTile(tile)}
            value={tile.symbol}
          />
  }

  render() {
    const { game } = this.props

    if (!game) return null

    const title = game.players.map(p => (p.name || null))
      .filter(n => !!n)
      .join(' vs ')

    return (
      <div className="Game">
        <h1>TIC TAC TOE</h1>
        <p>{title}</p>

        <div className="Board">
          {this.props.game.board.map(this.renderTile)}


        </div>
        <p> {this.props.game.winner ? `The winner is: ${this.props.game.winnerName}`:"The is no winner yet"}</p>

        <button> RESET </button>

        {/*
         <h2>Debug Props</h2>
         <pre>{JSON.stringify(this.props, true, 2)}</pre>
        */}

        <JoinGameDialog gameId={game._id} />
      </div>
    )
  }
}

const mapStateToProps = ({ currentUser, games }, { match }) => {
  const game = games.filter((g) => (g._id === match.params.gameId))[0]
  const currentPlayer = game && game.players.filter((p) => (p.userId === currentUser._id))[0]

  return {
    currentPlayer,
    game,
    isPlayer: !!currentPlayer,
    hasTurn: currentPlayer && currentPlayer._id === currentUser._id,
    isJoinable: game && !currentPlayer && game.players.length < 2
  }
}

export default connect(mapStateToProps, {subscribeToWebsocket, fetchOneGame, fetchPlayers, changeTile: changeTile
})(Game)
