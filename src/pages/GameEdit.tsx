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

const log = getLogger('GameEdit');

interface GameEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const GameEdit: React.FC<GameEditProps> = ({history, match}) => {
    const {games, saving, savingError, saveGame} = useContext(GameContext);
    const [appid, setAppid] = useState(0);
    const [name, setName] = useState('');
    const [developer, setDeveloper] = useState('');
    const [positive, setPositive] = useState(0);
    const [negative, setNegative] = useState(0);
    const [owners, setOwners] = useState('0....0');
    const [price, setPrice] = useState(0);
    const [game, setGame] = useState<GameProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id ? Number(match.params.id) : -1;
        const game = games?.find(it => it.id === routeId);
        setGame(game);
        if (game) {
            game.appid && setAppid(game.appid);
            game.name && setName(game.name);
            game.developer && setDeveloper(game.developer);
            game.positive && setPositive(game.positive);
            game.negative && setNegative(game.negative);
            game.owners && setOwners(game.owners);
            game.price && setPrice(game.price);
        }
    }, [match.params.id, games]);
    const handleSave = () => {
        const editedGame = game ? {...game, appid, name, developer, positive, negative, owners, price} : {
            appid,
            name,
            developer,
            positive,
            negative,
            owners,
            price
        };
        saveGame && saveGame(editedGame).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{match.params.id ? "Edit" : "Save"}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            {match.params.id ? "Update" : "Save"}
                        </IonButton>
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
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save game'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default GameEdit;
