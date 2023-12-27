import React, {useEffect, useState} from 'react';
import './category.css'
import {Link, useParams} from "react-router-dom";


function SectionCat({param}){

    return (
        <Link to={"/category/" + param.cat_id} className="section category">
            <img src="/cat1.png" width="auto" height="50%" style={{padding: 0}}/>
            <div className="cat-text">
                <p className="cat-title">{param.title}</p>
                <p className="cat-percent">100 %</p>
            </div>
        </Link>
    )
}


function WrapperLeft() {

     const [achievement, setAchievement] = useState([{}])

    useEffect(() => {
        fetch('/api/catalog').then(
            res => res.json()
        ).then(
            data => setAchievement(data)
        )
    },[])

   const sections=achievement.map((section) =>
       // I don't know why the key error won't disappear with the original id's of my data, just add 0 for now
       <SectionCat key={section.cat_id + 0} param={section}></SectionCat>
    )



    return (
        <div id="wrapper-left">
            {sections}
        </div>

    )
}


function Info({param}){


    return (

            <div className="section progress">
                <img className="left-img" src="/UI_AchievementIcon_1_0.png"/>
                <p className="information">
                    <span className="title">{param.name}</span>
                    <span className="description">{param.description}</span>
                </p>
                <img className="primo" src="/5stprimo.webp"/>
                <div className="completion">
                    <button className="claim" type="button">Mark</button>
                </div>
            </div>
    )
}


function WrapperRight() {

    let {categoryId} = useParams()

    const [info, setInfo] = useState([{}])

    useEffect(() => {
        fetch('/api/category/' + categoryId).then(
            res => res.json().then(
                data => setInfo(data)
            )
        )
    }, []);



    const achievements = info.map((ach)=>
        <Info param={ach}></Info>
    )


    return (
        <div id="wrapper-right">
            <div className="canvas">
            </div>
            <div className="paper">
                <div className="scroll-style ">
                {achievements}
                </div>
            </div>
        </div>
    )
}

function Category(props) {

    return (
        <div id="content">
            <WrapperLeft></WrapperLeft>
            <WrapperRight></WrapperRight>

        </div>
    );
}

export default Category;