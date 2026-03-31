import React from "react";
import "./FreeDrink.css"
import { useMenu } from "../../../context/MenuContext";

const FreeDrink = () => {

    const { menuData } = useMenu();
    const falseDataFreeDrink = menuData.falseDataFreeDrink;
    

    return(

        <div className="free-drink">
        <h2>Безалкогольні напої</h2>
        <div className="header-free-drink">
            <p className="header-free-drink-name">Назва</p>
            <p className="header-free-drink-about"></p>
            <p className="header-free-drink-volume">Об'єм</p>
            <p className="header-free-drink-price">Ціна</p>
        </div>
        <div className="this-free-drink">
            {falseDataFreeDrink.map((freeDrink, index) => (
                <div key={index} className="free-drink-item">
                    <p className="header-free-drink-name">{freeDrink.name}</p>
                    <p className="header-free-drink-about">{freeDrink.about}</p>
                    <p className="header-free-drink-volume">{freeDrink.volume}</p>
                    <p className="header-free-drink-price">{freeDrink.price}</p>
                </div>
            ))}
        </div>
    </div>

    )

}

export default FreeDrink;