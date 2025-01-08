import React from "react";
import logo from "../../img/logo/template.svg"
import logox from '../../img/logo/12.svg'
import "./Menu.css"


const Menu = () =>{

    return(
        <div className="menu">
            <div className="continer">
                <div className="menu-content">
                <div className="menu-logo">
                {/* <img src={logo} alt="menu logo" className="logo-m"/> */}
                <img src={logox} alt="menu logo" className="logo-m crismx"/>
                </div>
                <div className="menu-button">
                    <a href="/menu">Меню</a>
                    <a href="/promotion">Акції</a>
                    <a href="https://www.instagram.com/bunker__pub_brody/" target="_blank">Instagram</a>
                </div>
                </div>
            </div> 
        </div>
    )

}

export default Menu;