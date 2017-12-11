import API from '../../api/client'
import {
  APP_LOADING,
  APP_DONE_LOADING,
  LOAD_ERROR,
  LOAD_SUCCESS
} from '../loading'
// import { TAKE_TILE } from './subscribe'

const api = new API()

export const TILE_UPDATE = 'TILE_UPDATE'

export default (tile, game, players, currentPlayer,turn) => {
  return (dispatch) => {

    dispatch({ type: APP_LOADING })

    const content = {tile, players, currentPlayer, game, turn}

    console.log(content)

    api.patch(`/games/${game._id}`, content)
      .then(res => {

        dispatch({ type: APP_DONE_LOADING })
        dispatch({ type: LOAD_SUCCESS })
      })
      .catch((error) => {
        dispatch({ type: APP_DONE_LOADING })
        dispatch({
          type: LOAD_ERROR,
          payload: error.message
        })
      })
  }
}
