import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React, {useContext} from 'react';
import {Redirect, RouteComponentProps} from "react-router";
import {add} from "ionicons/icons";
import {getLogger} from '../core';
import {GameContext} from './GameProvider';

import '../theme/variables.css';
import Game from "./Game";
import {AuthContext} from "../auth";

const log = getLogger('GameList');

const GameList: React.FC<RouteComponentProps> = ({history}) => {
    const {games, fetching, fetchingError, _deleteGame} = useContext(GameContext);
    const {logout} = useContext(AuthContext);

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };


    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonRow class="ion-align-items-center ion-margin">
                        <IonTitle>Game List</IonTitle>
                        <IonButton class="ion-margin-end" onClick={handleLogout}>Logout</IonButton>
                    </IonRow>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching games"/>
                {games && (
                    <IonList>
                        {games.map(({_id, appid, name, developer, positive, negative, owners, price}) =>
                            <Game key={_id} _id={_id} appid={appid} name={name} developer={developer}
                                  positive={positive}
                                  negative={negative} owners={owners} price={price}
                                  onEdit={_id => history.push(`/game/${_id}`)}
                                  onDelete={_id => _deleteGame && _deleteGame({_id: _id, name: name})}/>)}
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
