import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {GameProps} from './GameProps';
import {createGame, deleteGame, getGames, newWebSocket, updateGame} from './GameApi';
import {AuthContext} from "../auth";
import {Storage} from "@capacitor/core";

const log = getLogger('GameProvider');

type SaveGameFn = (game: GameProps) => Promise<any>;
type DeleteGameFn = (game: GameProps) => Promise<any>;

export interface GamesState {
    games?: GameProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    _saveGame?: SaveGameFn,
    deleting: boolean,
    deletingError?: Error | null,
    _deleteGame?: DeleteGameFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: GamesState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_GAMES_STARTED = 'FETCH_GAMES_STARTED';
const FETCH_GAMES_SUCCEEDED = 'FETCH_GAMES_SUCCEEDED';
const FETCH_GAMES_FAILED = 'FETCH_GAMES_FAILED';
const SAVE_GAMES_STARTED = 'SAVE_GAMES_STARTED';
const SAVE_GAMES_SUCCEEDED = 'SAVE_GAMES_SUCCEEDED';
const SAVE_GAME_FAILED = 'SAVE_GAME_FAILED';
const DELETE_GAME_STARTED = 'DELETE_GAME_STARTED';
const DELETE_GAME_SUCCEEDED = 'DELETE_GAME_SUCCEEDED';
const DELETE_GAME_FAILED = 'DELETE_GAME_FAILED';

const reducer: (state: GamesState, action: ActionProps) => GamesState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_GAMES_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_GAMES_SUCCEEDED:
                return {...state, games: payload.games, fetching: false};
            case FETCH_GAMES_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_GAMES_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_GAMES_SUCCEEDED: {
                const games = [...(state.games || [])];
                const game = payload.game;
                const index = games.findIndex(it => it._id === game._id);
                if (index === -1) {
                    games.splice(games.length, 0, game);
                } else {
                    games[index] = game;
                }
                return {...state, games: games, saving: false};
            }
            case SAVE_GAME_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_GAME_STARTED:
                return {...state, deletingError: null, deleting: true};
            case DELETE_GAME_SUCCEEDED: {
                const games = [...(state.games || [])];
                const game = payload.game;
                const index = games.findIndex(it => it._id === game._id);
                if (index !== -1) {
                    games.splice(index, 1);
                }
                return {...state, games: games, deleting: false};
            }
            case DELETE_GAME_FAILED:
                return {...state, deletingError: payload.error, deleting: false};
            default:
                return state;
        }
    };

export const GameContext = React.createContext<GamesState>(initialState);

interface GameProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const GameProvider: React.FC<GameProviderProps> = ({children}) => {
    const {token, _id} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {games, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getGamesEffect, [token]);
    useEffect(wsEffect, [token]);
    const _saveGame = useCallback<SaveGameFn>(saveGameCallback, [token]);
    const _deleteGame = useCallback<DeleteGameFn>(deleteGameCallback, [token]);
    const value = {
        games,
        fetching,
        fetchingError,
        saving,
        savingError,
        _saveGame,
        deleting,
        deletingError,
        _deleteGame
    };
    log('returns');
    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );

    function getGamesEffect() {
        let canceled = false;
        fetchGames();
        return () => {
            canceled = true;
        }

        async function fetchGames() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchGames started');
                dispatch({type: FETCH_GAMES_STARTED});
                const games = await getGames(token);
                log('fetchGames succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_GAMES_SUCCEEDED, payload: {games}});
                }
            } catch (error) {
                log('fetchGames failed');
                alert("OFFLINE!");
                const storageGames: any[] = [];
                await Storage.keys().then(function (allKeys) {
                    allKeys.keys.forEach((key) => {
                        Storage.get({key}).then(function (it) {
                            try {
                                const object = JSON.parse(it.value);
                                if (String(object.userId) === String(_id))
                                    storageGames.push(object);
                            } catch (e) {
                            }
                        });
                    })
                });
                dispatch({type: FETCH_GAMES_SUCCEEDED, payload: {games: storageGames}});
            }
        }
    }

    async function saveGameCallback(game: GameProps) {
        try {
            log('saveGame started');
            dispatch({type: SAVE_GAMES_STARTED});
            const savedGame = await (game._id ? updateGame(token, game) : createGame(token, game));
            log('saveGame succeeded');
            dispatch({type: SAVE_GAMES_SUCCEEDED, payload: {game: savedGame}});
        } catch (error) {
            log('saveGame failed');
            alert("OFFLINE!");
            game._id = game._id ? game._id : Date.now()
            await Storage.set({
                key: String(game._id),
                value: JSON.stringify(game)
            });
            dispatch({type: SAVE_GAMES_SUCCEEDED, payload: {game}});
        }
    }

    async function deleteGameCallback(game: GameProps) {
        try {
            log('deleteGame started');
            dispatch({type: DELETE_GAME_STARTED});
            const deletedGame = await deleteGame(token, game);
            log('saveGame succeeded');
            dispatch({type: DELETE_GAME_SUCCEEDED, payload: {game: deletedGame}});
        } catch (error) {
            log('deleteGame failed');
            alert("OFFLINE!");
            await Storage.remove({
                key: String(game._id)
            });
            dispatch({type: DELETE_GAME_SUCCEEDED, payload: {game}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {event, payload: game} = message;
                console.log(JSON.stringify(message));
                log(`ws message, game ${event}`);
                if (event === 'created' || event === 'updated') {
                    dispatch({type: SAVE_GAMES_SUCCEEDED, payload: {game}});
                }

                if (event === "deleted") {
                    dispatch({type: DELETE_GAME_SUCCEEDED, payload: {game}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
