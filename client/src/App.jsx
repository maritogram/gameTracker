import {useState} from 'react';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";

import Home from "./pages/home.jsx";
import MyHeader from "./components/header.jsx";
import MyFooter from "./components/footer.jsx";
import Category from "./pages/category.jsx";


const hey = import.meta.glob('./assets/*')


async function imageLoader() {

    const srcArr = Object.keys(hey);

    //regex to only get the name of the images further down
    const myRe = /.*\/assets/;

    const promises = srcArr.map((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.src = src.replace(myRe, "");
            img.onload = resolve(img);
            img.onerror = reject(src);

        });
    });


    return Promise.all(promises);
}

async function achievementDataLoader(queryClient) {
    const fetchAchievements = async () => {
        const res = await fetch('https://swucx2qsy6.execute-api.us-east-1.amazonaws.com/default/api/achievements/', {mode: 'cors'});
        if (!res.ok) {
            throw new Error('Network response was not ok.')
        }
        return res.json()
    }

    return queryClient.fetchQuery('achievements', fetchAchievements)

}



async function categoryDataLoader(queryClient) {
    const fetchCategories = async () => {
        const res = await fetch('https://swucx2qsy6.execute-api.us-east-1.amazonaws.com/default/api/categories/', {mode: 'cors'});
        if (!res.ok) {
            throw new Error('Network response was not ok.');
        }

        return res.json();
    }

    return queryClient.fetchQuery('category', fetchCategories)
}

const fullDataLoader = async (queryClient) => {
    return Promise.all([imageLoader(), categoryDataLoader(queryClient), achievementDataLoader(queryClient)])
}


export default function App({queryClient}) {

    const router = createBrowserRouter([{
        element: <Layout/>, id: "root", loader: async () => {

            return fullDataLoader(queryClient);
        }, children: [{
            path: "/", element: <Home/>,
        }, {
            path: "category/", element: <Category/>,

        }, {
            path: "category/:categoryId", element: <Category/>,

        }]
    },

    ])

    return <RouterProvider router={router}/>;

}

function Layout() {

    //Initializes the object where the marked achievements will be marked.
    const achievementsObjectString = localStorage.getItem("achievements");
    if (achievementsObjectString == null || achievementsObjectString === "[object Object]") localStorage.setItem("achievements", "{}");
    const achievementsObject = JSON.parse(achievementsObjectString);

    // Gets the values of our achievements object (true or false / 1 or 0) and returns the sum of all of them. This will work
    // as our completed/marked achievements count
    const trueAchievementsObject = Object.values(achievementsObject).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const [marked, setMarked] = useState(trueAchievementsObject);

    return (<>
        <MyHeader marked={marked}></MyHeader>
        <Outlet context={[marked, setMarked]}></Outlet>
        <MyFooter></MyFooter>

    </>)


}

