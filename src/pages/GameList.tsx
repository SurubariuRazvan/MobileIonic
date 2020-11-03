import {
    IonContent, IonFab, IonFabButton,
    IonHeader, IonIcon, IonList, IonLoading,
    IonPage, IonTitle, IonToolbar
} from '@ionic/react';
import React, {useContext} from 'react';
import {RouteComponentProps} from "react-router";
import {add} from "ionicons/icons";
import {getLogger} from '../core';
import {GameContext} from "./GameProvider";

import '../theme/variables.css';
import Game from "./Game";
import {deleteGame} from "./GameApi";

const log = getLogger('GameList');

const GameList: React.FC<RouteComponentProps> = ({history}) => {
    const {games, fetching, fetchingError} = useContext(GameContext);
    log('render');

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Game List</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching games"/>
                {games && (
                    <IonList>
                        {games.map(({id, appid, name, developer, positive, negative, owners, price}) =>
                            <Game key={id} id={id} appid={appid} name={name} developer={developer} positive={positive}
                                  negative={negative} owners={owners} price={price}
                                  onEdit={id => history.push(`/game/${id}`)}
                                  onDelete={id => deleteGame({id: id, name: name})}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch games'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/game')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default GameList;
