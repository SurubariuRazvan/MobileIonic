import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {GameContext} from './GameProvider';
import {RouteComponentProps} from 'react-router';
import {GameProps} from './GameProps';
import {useNetwork} from "./useNetwork";
import {AuthContext} from "../auth";

const log = getLogger('GameEdit');

interface GameEditProps extends RouteComponentProps<{
    _id?: string;
}> {
}

const GameEdit: React.FC<GameEditProps> = ({history, match}) => {
    const {games, saving, savingError, _saveGame, oldGame, _getGameServer, _deleteGame} = useContext(GameContext);
    const {networkStatus} = useNetwork();
    const {_id} = useContext(AuthContext);

    const [appid, setAppid] = useState(0);
    const [name, setName] = useState('');
    const [developer, setDeveloper] = useState('');
    const [positive, setPositive] = useState(0);
    const [negative, setNegative] = useState(0);
    const [owners, setOwners] = useState('0 .. 0');
    const [price, setPrice] = useState(0);
    const [game0, setGame0] = useState<GameProps>();
    const [game1, setGame1] = useState<GameProps>();

    const [userId] = useState(Number(_id));

    useEffect(() => {
        log('useEffect');
        const routeId = match.params._id ? Number(match.params._id) : -1;
        const game = games?.find(it => it._id === routeId);
        setGame0(game);
        console.log(JSON.stringify(game));
        if (game) {
            game.appid && setAppid(game.appid);
            game.name && setName(game.name);
            game.developer && setDeveloper(game.developer);
            game.positive && setPositive(game.positive);
            game.negative && setNegative(game.negative);
            game.owners && setOwners(game.owners);
            game.price && setPrice(game.price);
            _getGameServer?.(routeId, game);
        }
    }, [match.params._id, games, _getGameServer]);

    useEffect(() => {
        setGame1(oldGame);
        log("setOldGame: " + JSON.stringify(oldGame));
    }, [oldGame]);

    const handleSave = () => {
        const editedGame = game0 ? {
            ...game0,
            appid,
            name,
            developer,
            positive,
            negative,
            owners,
            price,
            userId,
            status: 0,
            version: game0.version ? game0.version + 1 : 1
        } : {appid, name, developer, positive, negative, owners, price, userId, status: 0, version: 1};
        _saveGame && _saveGame(editedGame, networkStatus.connected).then(() => history.goBack());
    };

    const handleConflict1 = () => {
        if (oldGame) {
            const editedGame = {
                ...game0,
                appid,
                name,
                developer,
                positive,
                negative,
                owners,
                price,
                userId,
                status: 0,
                version: oldGame?.version + 1
            };
            _saveGame && _saveGame(editedGame, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };

    const handleConflict2 = () => {
        if (oldGame) {
            const editedGame = {
                ...oldGame,
                _id: game0?._id,
                status: 0,
                version: oldGame?.version + 1
            };
            _saveGame && _saveGame(editedGame, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };

    const handleDelete = () => {
        const editedGame = game0 ? {
            ...game0,
            appid,
            name,
            developer,
            positive,
            negative,
            owners,
            price,
            userId,
            status: 0,
            version: 0
        } : {
            appid,
            name,
            developer,
            positive,
            negative,
            owners,
            price,
            userId,
            status: 0,
            version: 0
        };
        _deleteGame?.(editedGame, networkStatus.connected).then(() => history.goBack());
    };

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{match.params._id ? "Edit" : "Save"}</IonTitle>
                    {/*TODO: change UI*/}
                    <div>Network status is {JSON.stringify(networkStatus)}</div>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            {match.params._id ? "Update" : "Save"}
                        </IonButton>
                        <IonButton onClick={handleDelete}>Delete</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem>
                        <IonLabel position="floating">Appid</IonLabel>
                        <IonInput type="number" value={appid}
                                  onIonChange={e => setAppid(parseInt(e.detail.value!, 10))}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Name</IonLabel>
                        <IonInput value={name} onIonChange={e => setName(e.detail.value!)}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Developer</IonLabel>
                        <IonInput value={developer} onIonChange={e => setDeveloper(e.detail.value!)}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Positive</IonLabel>
                        <IonInput type="number" value={positive}
                                  onIonChange={e => setPositive(parseInt(e.detail.value!, 10))}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Negative</IonLabel>
                        <IonInput type="number" value={negative}
                                  onIonChange={e => setNegative(parseInt(e.detail.value!, 10))}>
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Owners</IonLabel>
                        <IonInput value={owners} onIonChange={e => setOwners(e.detail.value!)}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Price</IonLabel>
                        <IonInput type="number" value={price}
                                  onIonChange={e => setPrice(parseInt(e.detail.value!, 10))}>
                        </IonInput>
                    </IonItem>
                </IonList>
                {game1 && (
                    <IonList>
                        <IonItem>
                            <IonLabel>APPID: {game1.appid}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>NAME: {game1.name}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>DEVELOPER: {game1.developer}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>POSITIVE: {game1.positive}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>NEGATIVE: {game1.negative}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>OWNERS: {game1.owners}</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel>PRICE: {game1.price}</IonLabel>
                        </IonItem>

                        <IonButton onClick={handleConflict1}>Choose first version</IonButton>
                        <IonButton onClick={handleConflict2}>Choose second version</IonButton>
                    </IonList>
                )
                }
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save game'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default GameEdit;
