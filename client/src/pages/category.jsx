import React, {forwardRef, useEffect, useRef, useState} from 'react';
import './category.css'
import {NavLink, useNavigate, useOutletContext, useParams, useSearchParams} from "react-router-dom";
import {useFetchCategories} from "../hooks/useFetchCategories.jsx";
import {useFetchAchievements} from "../hooks/useFetchAchievements.jsx";

import {animated, useInView, useSpring} from "@react-spring/web";
import ProgressBar from "../components/percentage.jsx";


function SearchBar() {

    const [searchParams] = useSearchParams();
    const search = searchParams.get('s')

    const navigate = useNavigate()
    const [input, setInput] = useState("")

    const handleChange = (e) => {
        e.preventDefault()
        setInput(e.target.value.trim())
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (input !== search && input) {
            navigate("../category?s=" + input)
        }

    }

    return (
        <form className="search" onSubmit={handleSubmit}>
            <input
                className="search-bar"
                type="search"
                placeholder="Search for Achievements..."
                onChange={handleChange}
            />
        </form>

    )


}

const CategoryCard = forwardRef(function CategoryCard({category, achievements}, ref) {

    //Should probably spend some more time in this part

    const categoryTitle = category.title
    const categoryId = category.cat_id

    const achievementsFromCategory = achievements.filter(({category_id}) => {
        return parseInt(categoryId) === (category_id);
    })
    const firstAchievementFromCategory = achievementsFromCategory[0].ach_id;
    const lastAchievementFromCategory = achievementsFromCategory[achievementsFromCategory.length - 1].ach_id;

    const achievementsObject = JSON.parse(localStorage.getItem("achievements"))


    /*
    First gets all the keys (achievement ids) from the local storage object. If they are between the valid achievements
    and their value is true, add it to the filtered array.
     */
    let percentage = 0;
    const completedAchievementsFromCategory = Object.keys(achievementsObject).filter((element) => {
        if (element >= firstAchievementFromCategory && element <= lastAchievementFromCategory) {
            if (achievementsObject[element]) return true;
        }
        return false
    })

    percentage = ((completedAchievementsFromCategory.length / (lastAchievementFromCategory - firstAchievementFromCategory + 1)) * 100).toFixed()


    return (
        <NavLink to={"/category/" + categoryId} className="section category" ref={ref}>
            <img alt="Category Token" src="/cat1.png" width="26px" height="50%" style={{margin: "0 10px"}}/>
            <div className="cat-text">
                <p className="cat-title">{categoryTitle}</p>
                <p className="cat-percent">{percentage} %</p>
            </div>

        </NavLink>
    )
})

function WrapperLeft({categories, achievements}) {

    const itemsRef = useRef(null);

    const {categoryId} = useParams()

    function getMap() {
        if (!itemsRef.current) {
            itemsRef.current = new Map();
        }

        return itemsRef.current;
    }


    // Shhhh, works
    useEffect(() => {
        if (categoryId !== undefined && getMap().has(parseInt(categoryId)))//{
            getMap().get(parseInt(categoryId)).scrollIntoView();
        // } else {
        //     console.log("ref hasn't been set, or no specific category")
        // }
    }, []);


    return (
        <div id="wrapper-left">
            <SearchBar></SearchBar>
            <div className="categories">
                {
                    categories.map((category) => <CategoryCard key={category.cat_id + 0} category={category}
                                                               achievements={achievements}
                                                               ref={(node) => {
                                                                   const map = getMap();
                                                                   if (node) {
                                                                       map.set(category.cat_id, node);
                                                                   } else {
                                                                       map.delete(category.cat_id);
                                                                   }
                                                               }}
                        ></CategoryCard>
                    )
                }
            </div>
        </div>
    )
}


function AchievementCardTitle({achievement, highlight = false, searchString}) {

    const title = achievement.name;

    if (highlight) {
        const firstInstance = title.toLowerCase().indexOf(searchString.toLowerCase());

        const leftPart = title.slice(0, firstInstance);
        const middlePart = title.slice(firstInstance, (firstInstance + searchString.length));
        const rightPart = title.slice((firstInstance + searchString.length), title.length);

        return (
            <span className="title">{leftPart}<span style={{color: '#f39816'}}>{middlePart}</span>{rightPart}</span>
        )

    }

    return (
        <span className='title'>{title}</span>
    )

}


function AchievementCardButton({achievement, marked, setMarked, completed, previous = null}) {

    const markAchievement = (e) => {
        e.preventDefault()
        const achievementObject = JSON.parse(localStorage.getItem("achievements"))
        Object.assign(achievementObject, {[achievement.ach_id]: true});
        localStorage.setItem("achievements", JSON.stringify(achievementObject))

        // this might not be good, but works for now
        setMarked(marked + 1)
    }

    const unmarkAchievement = (e) => {

        e.preventDefault()
        const achievementObject = JSON.parse(localStorage.getItem("achievements"))

        if (previous != null) {
            Object.assign(achievementObject, {[previous.ach_id]: false});

        } else {
            Object.assign(achievementObject, {[achievement.ach_id]: false});
        }


        localStorage.setItem("achievements", JSON.stringify(achievementObject))

        // this might not be good, but works for now
        setMarked(marked - 1)

    }


    if (completed) {
        return (
            <div className="completion done">
                <p> Completed</p>
                <button
                    className="unclaim"
                    type="button"
                    onClick={unmarkAchievement}
                >
                    Unmark
                </button>
            </div>
        )
    } else {

        if (previous != null) {
            return (
                <div className="completion">
                    <button
                        className="claim"
                        type="button"
                        onClick={markAchievement}
                    >
                        Mark
                    </button>
                    <button
                        className="unclaim"
                        type="button"
                        onClick={unmarkAchievement}
                    >
                        Unmark
                    </button>


                </div>
            )


        }


        return (
            <div className="completion">
                <button
                    className="claim"
                    type="button"
                    onClick={markAchievement}
                >
                    Mark
                </button>
            </div>
        )
    }


}


function AchievementCard({
                             filteredAchievements,
                             achievement,
                             highlight = false,
                             searchString,
                             marked,
                             setMarked,
                             completed,
                             achievementsObject
                         }) {


    const index = filteredAchievements.findIndex(ach => ach.ach_id === achievement.ach_id);

    //HERE MAYBE
    // const adjustIndex = filteredAchievements.forEach()

    const nextAchievement = filteredAchievements[index + 1];
    const previousAchievement = filteredAchievements[index - 1];


    if (completed) {

        if (achievement.multiprt !== 1) {
            return (
                <div className={"section progress completed"}>
                    <img alt="Achievement Icon" className="left-img" src="/UI_AchievementIcon_1_1.png"/>
                    <p className="information">
                        <AchievementCardTitle achievement={achievement} highlight={highlight}
                                              searchString={searchString}></AchievementCardTitle>
                        <span className="description">{achievement.description}</span>
                    </p>
                    <img alt="Primogems" className="primo" src="/5stprimo.webp"/>
                    <AchievementCardButton achievement={achievement} marked={marked} setMarked={setMarked}
                                           completed={completed}></AchievementCardButton>
                </div>
            )
        }

        if (achievement.part === 3) {
            return (
                <div className={"section progress completed"}>
                    <img alt="Achievement Icon" className="left-img" src="/UI_AchievementIcon_3_3.png"/>
                    <p className="information">
                        <AchievementCardTitle achievement={achievement} highlight={highlight}
                                              searchString={searchString}></AchievementCardTitle>
                        <span className="description">{achievement.description}</span>
                    </p>
                    <img alt="Primogems" className="primo" src="/5stprimo.webp"/>
                    <AchievementCardButton achievement={achievement} marked={marked} setMarked={setMarked}
                                           completed={completed}></AchievementCardButton>
                </div>
            )
        }

    } else {


        const springs = useSpring({
            from: {
                opacity: 0
            },
            to: {
                opacity: 1,

            },
            delay: 30 * (index % 15),
        });


        //Checks if it's part of a multipart achievement.
        if (achievement.multiprt === 1) {

            if (achievement.part !== 1) {
                console.log(filteredAchievements)
                // If it's not the first part, then check if the previous is complete
                if (achievementsObject[previousAchievement.ach_id] === true) {

                    const starImageURL = "/UI_AchievementIcon_3_" + (achievement.part - 1) + ".png"

                    return (


                        <div className={"section progress"}>
                            <img alt="Achievement Icon" className="left-img" src={starImageURL}/>
                            <p className="information">
                                <AchievementCardTitle achievement={achievement} highlight={highlight}
                                                      searchString={searchString}></AchievementCardTitle>
                                <span className="description">{achievement.description}</span>
                            </p>
                            <img alt="Primogems" className="primo" src="/5stprimo.webp"/>
                            <AchievementCardButton achievement={achievement} marked={marked} setMarked={setMarked}
                                                   completed={completed}
                                                   previous={previousAchievement}></AchievementCardButton>
                        </div>


                    )

                }
            } else {


                return (
                    <animated.div style={springs}>
                        <div className={"section progress"}>
                            <img alt="Achievement Icon" className="left-img" src="/UI_AchievementIcon_3_0.png"/>
                            <p className="information">
                                <AchievementCardTitle achievement={achievement} highlight={highlight}
                                                      searchString={searchString}></AchievementCardTitle>
                                <span className="description">{achievement.description}</span>
                            </p>
                            <img alt="Primogems" className="primo" src="/5stprimo.webp"/>
                            <AchievementCardButton achievement={achievement} marked={marked} setMarked={setMarked}
                                                   completed={completed}></AchievementCardButton>
                        </div>
                    </animated.div>
                )


            }


        } else {

            return (
                <animated.div style={springs}>
                    <div className={"section progress"}>
                        <img alt="Achievement Icon" className="left-img" src="/UI_AchievementIcon_1_0.png"/>
                        <p className="information">
                            <AchievementCardTitle achievement={achievement} highlight={highlight}
                                                  searchString={searchString}></AchievementCardTitle>
                            <span className="description">{achievement.description}</span>
                        </p>
                        <img alt="Primogems" className="primo" src="/5stprimo.webp"/>
                        <AchievementCardButton achievement={achievement} marked={marked} setMarked={setMarked}
                                               completed={completed}></AchievementCardButton>
                    </div>
                </animated.div>
            )
        }


    }

}


function DisplayedAchievements({categoryId, totalAchievements, categories, marked, setMarked}) {

    const achievementsObject = JSON.parse(localStorage.getItem("achievements"))

    const [searchParams] = useSearchParams();
    const search = searchParams.get('s'); //The search query string.

    /*
    Filters all the achievements depending on what needs to be displayed.
    If the category ID was found it will return true for all the achievements that contain such ID.
    If no category ID was found it means that specific achievements are being looked for. Therefore,
    we see if the search query is includedso4 in the title of the achievement. If it is, we increment the match count and
    return the respective boolean.
     */
    let matchCount = 0;
    const filteredAchievements = totalAchievements.filter(({category_id, name}) => {
        if (categoryId !== undefined) {
            return parseInt(categoryId) === (category_id);
        } else {
            const match = name.toLowerCase().includes(search.toLowerCase());
            if (match) matchCount++;
            return (match)
        }
    })

    /*
    Decides how each achievement should be rendered.
    If the user is looking at a specific category (categoryId exists), simply render them.
    If the above isn't the case, we know the search function is being used. This means that we will also need to render
    the categories of the rendered achievements. For this we check if the previous achievement belongs to the current
    achievement's category, if it doesn't we render the title of the category as to declare a new section of achievements.
    */
    let previousTitle = ""
    const outputAchievements = (currentAchievement, index, array) => {
        const currentTitle = categories[currentAchievement.category_id - 1].title;

        if (categoryId !== undefined) {

            return <AchievementCard key={currentAchievement.ach_id + 0} filteredAchievements={filteredAchievements}
                                    achievement={currentAchievement} marked={marked} setMarked={setMarked}
                                    completed={achievementsObject[currentAchievement.ach_id]}
                                    achievementsObject={achievementsObject}></AchievementCard>

        }

        if (previousTitle !== currentTitle) {
            previousTitle = currentTitle;
            return (
                <>
                    {/*//FIX KEY ISSUE */}
                    <div className={"section s-title"} key={currentAchievement.category_id - 1}>{currentTitle}</div>
                    <AchievementCard key={currentAchievement.ach_id + 1} filteredAchievements={filteredAchievements}
                                     achievement={currentAchievement} highlight={true} searchString={search}
                                     marked={marked} setMarked={setMarked}
                                     completed={achievementsObject[currentAchievement.ach_id]}
                                     achievementsObject={achievementsObject}></AchievementCard>
                </>
            )
        } else {
            return (<AchievementCard key={currentAchievement.ach_id + 0} filteredAchievements={filteredAchievements}
                                     achievement={currentAchievement} highlight={true} searchString={search}
                                     marked={marked} setMarked={setMarked}
                                     completed={achievementsObject[currentAchievement.ach_id]}
                                     achievementsObject={achievementsObject}></AchievementCard>)
        }
    }


    if (categoryId !== undefined) {
        return (
            <>
                {filteredAchievements.sort((a, b) => {


                    // I feel like this can be simplified, I'll research later.

                    if (a.ach_id < b.ach_id) {
                        if ((achievementsObject[a.ach_id]) && a.name !== b.name) {
                            return 1
                        } else {
                            return -1
                        }
                    } else {
                        if ((achievementsObject[b.ach_id]) && a.name !== b.name) {
                            return -1
                        } else {
                            return 1
                        }


                    }

                }).map(outputAchievements)}
            </>
        )
    } else {
        return (
            <>
                {filteredAchievements.map(outputAchievements)}
            </>
        )
    }

}


function WrapperRight({categories, marked, setMarked, achievements}) {


    const {categoryId} = useParams(); //The ID of the category, undefined if no ID was found.

    if (categoryId != undefined) {

    }


    if (categoryId === undefined || categoryId <= 2) {

        return (
            <div id="wrapper-right">
                <div className="canvas">
                </div>
                <div className="paper">
                    <div></div>
                    <div className="scroll-style ">
                        <DisplayedAchievements categoryId={categoryId} totalAchievements={achievements}
                                               categories={categories} marked={marked}
                                               setMarked={setMarked}></DisplayedAchievements>
                    </div>
                </div>
            </div>
        )
    } else {

        const achievementsFromCategory = achievements.filter(({category_id}) => {
            return parseInt(categoryId) === (category_id);
        })

        const firstAchievementFromCategory = achievementsFromCategory[0].ach_id;
        const lastAchievementFromCategory = achievementsFromCategory[achievementsFromCategory.length - 1].ach_id;

        const achievementsObject = JSON.parse(localStorage.getItem("achievements"))


        /*
        First gets all the keys (achievement ids) from the local storage object. If they are between the valid achievements
        and their value is true, add it to the filtered array.
         */
        let percentage = 0;
        const completedAchievementsFromCategory = Object.keys(achievementsObject).filter((element) => {
            if (element >= firstAchievementFromCategory && element <= lastAchievementFromCategory) {
                if (achievementsObject[element]) return true;
            }
            return false
        })

        percentage = ((completedAchievementsFromCategory.length / (lastAchievementFromCategory - firstAchievementFromCategory + 1)) * 100).toFixed()


        return (
            <div id="wrapper-right">
                <div className="canvas">
                </div>
                <div className="paper">


                    <div className="progression ">
                        <div className="card-wrapper">
                            <img alt="Purple Background" className="purple-background"
                                 src="/Background_Item_4_Star.webp"/>
                            <img alt="Calling card" className="card"
                                 src="/Item_Achievement_Explorer.webp"/>
                        </div>
                        <div>
                            <div>

                            </div>
                            <ProgressBar percentage={percentage}></ProgressBar>
                        </div>


                    </div>
                    <div className="scroll-style ">
                        <DisplayedAchievements categoryId={categoryId} totalAchievements={achievements}
                                               categories={categories} marked={marked}
                                               setMarked={setMarked}></DisplayedAchievements>
                    </div>
                </div>
            </div>
        )

    }


}

function Category() {

    const [marked, setMarked] = useOutletContext();

    const {data: categoryData, status: categoryStatus} = useFetchCategories();

    const {data: achievementData, status: achievementStatus} = useFetchAchievements();

    if (achievementStatus === 'loading') {
        return (
            <p>Loading</p>
        )
    }

    if (achievementStatus === 'error') {
        return (
            <p>Error</p>
        )
    }

    return (
        <div id="content">
            <WrapperLeft categories={categoryData} achievements={achievementData}></WrapperLeft>
            <WrapperRight marked={marked} setMarked={setMarked} categories={categoryData}
                          achievements={achievementData}></WrapperRight>
        </div>
    );
}

export default Category;