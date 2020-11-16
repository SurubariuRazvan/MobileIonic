import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {GameProps} from './GameProps';
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;
const gameUrl = `http://${baseUrl}/api/games`;

export const getGames: (token: string) => Promise<GameProps[]> = (token) => {
    const result = axios.get(gameUrl, authConfig(token));
    result.then(function (result) {
        console.log("Entering gameApi - getGames - No Network Will Throw HERE!");
        result.data.forEach(async (game: GameProps) => {
            await Storage.set({
                key: String(game._id!),
                value: JSON.stringify(game),
            });
        });
    })

    return withLogs(result, 'getGames');
}

export const createGame: (token: string, game: GameProps) => Promise<GameProps[]> = (token, game) => {
    const result = axios.post(gameUrl, game, authConfig(token));
    result.then(async function (result) {
        await Storage.set({
            key: result.data._id!,
            value: JSON.stringify(result.data),
        });
    });
    return withLogs(result, 'createGame');
}

export const updateGame: (token: string, game: GameProps) => Promise<GameProps[]> = (token, game) => {
    const result = axios.put(`${gameUrl}/${game._id}`, game, authConfig(token));
    result.then(async function (result) {
        await Storage.set({
            key: result.data._id!,
            value: JSON.stringify(result.data),
        });
    });
    return withLogs(result, 'updateGame');
}

export const deleteGame: (token: string, game: GameProps) => Promise<GameProps[]> = (token, game) => {
    const result = axios.delete(`${gameUrl}/${game._id}`, authConfig(token));
    result.then(async function () {
        await Storage.remove({key: String(game._id!)});
    });
    return withLogs(result, 'deleteGame');
}

interface MessageData {
    event: string;
    payload: GameProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
