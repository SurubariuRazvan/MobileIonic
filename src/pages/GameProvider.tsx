import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {GameProps} from './GameProps';
import {createGame, getGames, newWebSocket, updateGame} from './GameApi';

const log = getLogger('GameProvider');

type SaveGameFn = (game: GameProps) => Promise<any>;
type DeleteGameFn = (game: GameProps) => Promise<any>;

export interface GamesState {
    games?: GameProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveGame?: SaveGameFn,
    deleting: boolean,
    deletingError?: Error | null,
    deleteGame?: DeleteGameFn,
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
                const index = games.findIndex(it => it.id === game.id);
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
                const index = games.findIndex(it => it.id === game.id);
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
    const [state, dispatch] = useReducer(reducer, initialState);
    const {games, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getGamesEffect, []);
    useEffect(wsEffect, []);
    const saveGame = useCallback<SaveGameFn>(saveGameCallback, []);
    const deleteGame = useCallback<DeleteGameFn>(deleteGameCallback, []);
    const value = {games, fetching, fetchingError, saving, savingError, saveGame, deleting, deletingError, deleteGame};
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
            try {
                log('fetchGames started');
                dispatch({type: FETCH_GAMES_STARTED});
                const games = await getGames();
                log('fetchGames succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_GAMES_SUCCEEDED, payload: {games}});
                }
            } catch (error) {
                log('fetchGames failed');
                dispatch({type: FETCH_GAMES_FAILED, payload: {error}});
            }
        }
    }

    async function saveGameCallback(game: GameProps) {
        try {
            log('saveGame started');
            dispatch({type: SAVE_GAMES_STARTED});
            const savedGame = await (game.id ? updateGame(game) : createGame(game));
            log('saveGame succeeded');
            dispatch({type: SAVE_GAMES_SUCCEEDED, payload: {game: savedGame}});
        } catch (error) {
            log('saveGame failed');
            dispatch({type: SAVE_GAME_FAILED, payload: {error}});
        }
    }

    async function deleteGameCallback(game: GameProps) {
        try {
            log('deleteGame started');
            dispatch({type: DELETE_GAME_STARTED});
            await deleteGame(game)
            log('saveGame succeeded');
            dispatch({type: DELETE_GAME_SUCCEEDED});
        } catch (error) {
            log('deleteGame failed');
            dispatch({type: DELETE_GAME_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket((message) => {
            if (canceled) {
                return;
            }
            const {event, payload: {game}} = message;
            log(`ws message, game ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({type: SAVE_GAMES_SUCCEEDED, payload: {game}});
            }

            if (event === "deleted") {
                dispatch({type: DELETE_GAME_SUCCEEDED, payload: {game}});
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            // @ts-ignore
            closeWebSocket();
        }
    }
};
