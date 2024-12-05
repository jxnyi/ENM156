//console.log(userListSummary); 
const userListSummary = JSON.parse(sessionStorage.getItem('userList'))
// [{foodName: "Kikarter", countryName:"Kanada"}]
// let formattedData = new Map();

//[{{name country}, index}]


async function fetchFoodData() {
    try {
        const response = await fetch('foods.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        formattedData = data.map(item => `${item.food} (${item.country})`);
        fetchDataForUser(userListSummary, data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function fetchDataForUser(userList, fullData){
    for (const food of userList) {
        const foodName = food.foodName; 
        const countryName = food.countryName; 

        const userData = fullData.filter((foodItem => foodItem.food == foodName && foodItem.country == countryName));
        console.log(userData);
        // const food = formattedData.filter(item => `${item.food} (${item.country})`.toLowerCase() === prevItem.toLowerCase());
    }

 /*   fetch('foods.json')
        .then(response => response.json())
        .then(data => {
            //find(item => item.foodName == food && item.countryName == country);
        })
        .catch(error => console.error('Error getting data from JSON', error)); 
        */
}



fetchFoodData();
// fetchDataForUser("Kikärter", "Kanada");