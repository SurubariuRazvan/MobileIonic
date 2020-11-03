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
import Collapsible from "../core/Collapsible";

interface GamePropsExt extends GameProps {
    onEdit: (id?: number) => void;
    onDelete: (id?: number) => void;
}

const Game: React.FC<GamePropsExt> = ({id, appid, name, developer, positive, negative, owners, price, onEdit, onDelete}) => {
    return (
        <IonItemSliding key={id} id={String(id)}>
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
                <IonItemOption color="primary" expandable onClick={() => onEdit(id)}>
                    Update
                </IonItemOption>
            </IonItemOptions>
            <IonItemOptions side="end">
                <IonItemOption color="danger" expandable onClick={() => onDelete(id)}>
                    Delete
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};

export default Game;
