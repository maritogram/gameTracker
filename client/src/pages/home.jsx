import React from 'react';
import styles    from './home.module.css';

import {Link} from "react-router-dom";

import {useFetchCategories} from '../hooks/useFetchCategories.jsx'
import {useFetchAchievements} from "../hooks/useFetchAchievements.jsx";





function Cell({category, achievements}){

    const categoryId = category.cat_id

    const achievementsFromCategory = achievements.filter(({category_id})=> {
            return parseInt(categoryId) === (category_id);
    })
    const firstAchievementFromCategory =  achievementsFromCategory[0].ach_id;
    const lastAchievementFromCategory =  achievementsFromCategory[achievementsFromCategory.length - 1].ach_id;

    const achievementsObject = JSON.parse(localStorage.getItem("achievements"))


    /*
    First gets all the keys (achievement ids) from the local storage object. If they are between the valid achievements
    and their value is true, add it to the filtered array.
     */

    const completedAchievementsFromCategory = Object.keys(achievementsObject).filter((element)=>{
        if (element >= firstAchievementFromCategory && element <= lastAchievementFromCategory){
            if(achievementsObject[element]) return true;
        }
        return false
    })
    let percentage = 0;
    percentage = ((completedAchievementsFromCategory.length / (lastAchievementFromCategory - firstAchievementFromCategory + 1)) * 100).toFixed()



    return (
        <div className={styles.cell_wrapper}>
            <Link to={'category/' + category.cat_id} className={styles.cell}>
                <img className={styles.ins_image} alt={category.title} src={"/cat/acat" + category.cat_id + ".webp"}/>
                <p className={`${styles.card_title} ${styles[`font${categoryId}`]}`}>{category.title}</p>
                <p className={styles.percentage}>{percentage}%</p>
                <div className={styles.progress_outer}>
                    <div className={styles.progress_bar} style={{width: percentage + "%"}}></div>
                </div>
            </Link>
        </div>


    )

}

function AchievementCategories() {


    const {data: categoryData, status: categoryStatus} = useFetchCategories();
    const {data:achievementData, status:achievementStatus} = useFetchAchievements();

    if (achievementStatus  === 'loading') {
        return (
            <p>Loading</p>
        )
    }

    if(achievementStatus === 'error'){
         return (
             <p>Error</p>
         )
    }


    return (
        <div className={styles.guts}>
            {categoryData.map(cat => (
                <Cell key={cat.cat_id + 0} category={cat} achievements={achievementData}></Cell>
            ))}
        </div>
    )
}


function Home() {
    return (
        <AchievementCategories>
        </AchievementCategories>
    );
}

export default Home;