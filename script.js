
const searchForms = [
    document.querySelector("#nav-query-form"),
    document.querySelector("#workoutsearch"),
];



async function searchYoutube(word) {
    console.log('searchYoutube', word)
    const url = `https://youtube138.p.rapidapi.com/auto-complete/?q=${word}&hl=en&gl=US`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f0e0a900a4msh479711aa70c3583p1d48bejsn352447a82dc3',
            'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
    return result

    // const youtubeResp = await fetch(
    //     ''
    // );

    // const youtubeResultJSON = await youtubeResp.json();



}

async function searchForWorkout(query) {

    const url = `https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises?muscle=${query}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f0e0a900a4msh479711aa70c3583p1d48bejsn352447a82dc3',
            'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        // const result = await response.text();
        return response
        // console.log(result);
    } catch (error) {
        console.error(error);
    }
    // return fetch(
    //     ''
    // );
}

async function slowYTRoll(query, delay) {
    console.log('slowYTRoll', query)
    const p = new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log('timeout done for', query)
            resolve(searchYoutube(query))
        }, delay)
    })
    return p
}

async function onSearch(ev) {
    ev.preventDefault();

    const formData = new FormData(ev.target);

    const query = formData.get("query");
    const workoutResults = await (await searchForWorkout(query)).json();
    console.log("workoutResults", workoutResults);


    let delay = 0
    const youtubeURLs = await Promise.all(
        workoutResults.map(async (wordObj) => await slowYTRoll(wordObj.name, delay+=500))
    );
    console.log("youtubeURLs", youtubeURLs);
    console.log("youtube url", youtubeURLs.contents[0].video.videoId)
    const resultSet = persistSearchWithResults(query, workoutResults, youtubeURLs);


    // insert the result set into the dom

    const resultsElem = document.getElementById("rhyphy-result-set-list");
    resultsElem.innerHTML = ''

    // CREATES CARD COULD DISPLAY ANOTHER WAY
    resultsElem.append(...resultSet.results.map(createCardFromResult))

    // prepare a lin kto export the data
    const exportLink = document.getElementById("export");
    exportLink.href = makeDLURL(resultSet);

    // exportLink.download = "rhyphy-expor";

}

function makeDLURL(data) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Blob#creating_a_blob
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const blobURL = URL.createObjectURL(blob);
    return blobURL;
}



function persistSearchWithResults(term, workoutList, youtubeList) {
    console.log("term, workoutList, youtubeList", term, workoutList, youtubeList);

    const resultSet = resultSetObjFromLists(term, workoutList, youtubeList);
    console.log("resuilt set for local storage", resultSet);
    localStorage.setItem(term, JSON.stringify(resultSet));
    return resultSet;
}

function resultSetObjFromLists(word, workoutList, youtubeList) {
    const result = { word, results: [] };
    workoutList.forEach((workout, i) => {
        let workoutResult = youtubeList[i];
        result.results.push(makeResultObj(workout, workoutResult));
    });
    return result;
}



function makeResultObj(workoutResult, youtubeResult) {
    return {
        word: workoutResult.word,
        rhymeData: workoutResult,
        gifURL: youtubeResult,
    };
}

// need to notice the form was submitted
function addListeners(elem) {
    // given a form element as "elem", add an event listener
    elem.addEventListener("submit", onSearch);
}


searchForms.forEach(addListeners);





