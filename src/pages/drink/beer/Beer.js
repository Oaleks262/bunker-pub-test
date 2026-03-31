import React from "react";
import'./Beer.css';
import { useMenu } from "../../../context/MenuContext";

const Beer = () => {

    const { menuData } = useMenu();
    const falseDataBeer = menuData.falseDataBeer;
    


return(
    <div className="beer">
        <h2>Пиво</h2>
        <div className="header-beer">
            <p className="header-beer-name">Назва</p>
            <p className="header-beer-about">Опис</p>
            <p className="header-beer-volume">Об'єм</p>
            <p className="header-beer-price">Ціна</p>
        </div>
        <div className="this-beer">
            {falseDataBeer.map((beer, index) => (
                <div key={index} className="beer-item">
                    <p className="header-beer-name">{beer.name}</p>
                    <p className="header-beer-about">{beer.about}</p>
                    <p className="header-beer-volume">{beer.volume}</p>
                    <p className="header-beer-price">{beer.price}</p>
                </div>
            ))}
        </div>
    </div>
);
}

export default Beer;
