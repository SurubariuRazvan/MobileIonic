import React from 'react';
import {
    IonCardContent,
    IonCardTitle,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
} from '@ionic/react';
import {GameProps} from './GameProps';
import Collapsible from "./Collapsible";

interface GamePropsExt extends GameProps {
    onEdit: (_id?: number) => void;
    onDelete: (_id?: number) => void;
}

const Game: React.FC<GamePropsExt> = ({_id, appid, name, developer, positive, negative, owners, price, onEdit, onDelete}) => {
    return (
        <IonItemSliding key={_id} id={String(_id)}>
            <IonItem>
                <Collapsible>
                    <IonCardTitle>
                        {name}
                    </IonCardTitle>
                    <IonCardContent>
                        <div>appid: {appid}</div>
                        <div>developer: {developer}</div>
                        <div>positive: {positive}</div>
                        <div>negative: {negative}</div>
                        <div>owners: {owners}</div>
                        <div>price: {price}</div>
                    </IonCardContent>
                </Collapsible>
            </IonItem>

            <IonItemOptions side="start">
                <IonItemOption color="primary" expandable onClick={() => onEdit(_id)}>
                    Update
                </IonItemOption>
            </IonItemOptions>
            <IonItemOptions side="end">
                <IonItemOption color="danger" expandable onClick={() => onDelete(_id)}>
                    Delete
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};

export default Game;
