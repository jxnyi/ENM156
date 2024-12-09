//constant (container for list of elements added by user)
const ListDiv = document.getElementById("addedListDiv");
ListDiv.style.display = 'none';
const userList = []; 

var allJsonData;
var filteredJsonData;
var searchedValue = "undefined";

// const testingList = ["summary!!Kikärter.Kanada","summary!!Nötkött.Brasilien"];
window.onload = (event => {
  const listFromSummary = JSON.parse(sessionStorage.getItem('listFromSummary'));
  
  if (listFromSummary != null && listFromSummary.length >= 1) {
    for (let element of listFromSummary) {
      addElementToList(element);
    }
    ListDiv.style.display = 'block';
    updateVisibilityClearAllButton();
  }
})

/* Hämtar data från foods.json */
async function fetchFoodData() {
  try {
    const response = await fetch('foods.json');
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();

    allJsonData = data;

    const formattedData = data.map(item => `${item.food} (${item.country})`);
    autocomplete(document.getElementById('myInput'), data, formattedData);
    handleEnterKeySearch(document.getElementById('myInput'), data);

    const countryData = data.map(item => `${item.country}`);        
    handleCountryDropdown(countryData);               

  } catch (error) {
    console.error('Error:', error);
  }
}



/* autocomplete för sökfältet */
function autocomplete(inp, fullData, arr) {
  let currentFocus;
  inp.addEventListener('input', function () {
    const val = this.value.toLowerCase();

    const countryMenu = document.getElementById('countries');
    const chosenCountry = countryMenu.value;
    var filteredArr = arr;
    
    if (!(chosenCountry === 'Country')) {
      filteredArr = arr.filter(entry => entry.includes(chosenCountry));
    } 

    closeAllLists();

    if (!val) return false;

    currentFocus = -1;
    const listDiv = document.createElement('div');
    listDiv.setAttribute('id', this.id + 'autocomplete-list');
    listDiv.setAttribute('class', 'autocomplete-items');
    this.parentNode.appendChild(listDiv);

    filteredArr.forEach((item, index) => {
      if (item.toLowerCase().includes(val)) {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<strong>${item.substr(0, val.length)}</strong>${item.substr(val.length)}`;
        itemDiv.addEventListener('click', function () {
          inp.value = item;
          const selectedData = fullData.filter(
            foodItem => `${foodItem.food} (${foodItem.country})`.toLowerCase() === item.toLowerCase()
          );
          searchedValue = item.toLowerCase();
          if (selectedData.length > 0) {
            showDetails(selectedData); // Display the results in the results box
          }
          
          closeAllLists();
        });
        listDiv.appendChild(itemDiv);
      }
    });
  });

  /* Funktionen lyssnar på när användaren börjar skriva i sökfältet */
  inp.addEventListener('keydown', function (e) {
    const list = document.getElementById(this.id + 'autocomplete-list');
    if (!list) return;

    let items = list.getElementsByTagName('div');
    if (e.keyCode === 40) {           //arrowkey down
      currentFocus++;
      addActive(items);
    } else if (e.keyCode === 38) {    //arrowkey up
      currentFocus--;
      addActive(items);
    } else if (e.keyCode === 13) {    //enter
      e.preventDefault();
      if (currentFocus > -1) {
        items[currentFocus].click();
      }
    }
  });
  /* Hjälpfunktion till lyssnarfunktionen */
  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add('autocomplete-active');
  }

 /* Hjälpfunktion till addActive-funktionen */
  function removeActive(items) {
    for (const item of items) {
      item.classList.remove('autocomplete-active');
    }
  }

  /* Rensar listan för autocomplete förslag, tillhör autocomplete funktionen */
  function closeAllLists() {
    const items = document.getElementsByClassName('autocomplete-items');
    for (const item of items) {
      item.parentNode.removeChild(item);
    }
  }

  /* Rullistan från autocomplete försvinner, när man trycker utanför sökfältet */
  document.addEventListener('click', function (e) {
    if (e.target !== inp) {
      closeAllLists();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { // Use 'key' for modern browsers
      closeAllLists();
    }
    });
}


/* hämta och visa information för sökta livsmedlet */
function showDetails(items) {
  const resultContainer = document.querySelector('.result-container'); // Select result container
  const resultContent = document.getElementById('result'); // Select the result content area
  const template = document.getElementById('result-template'); // Access the template
  ListDiv.style.display = 'none';

  resultContent.innerHTML = ''; // Clear previous results

  if (items.length === 0) {    
    // No results, hide the container
    resultContainer.style.display = 'none';
  } else {
    // Show the container if there are results
    items.forEach(item => {
      const detailDiv = template.content.cloneNode(true);

      // Populate template with data
      detailDiv.querySelector('.food-name').textContent = item.food;
      detailDiv.querySelector('.food-country').textContent = item.country;
      detailDiv.querySelector('.food-raknebas').textContent = item.raknebas;
      detailDiv.querySelector('.food-carbon-output').textContent = item.carbonOutput;

      const addButton = document.createElement('button');
      addButton.innerHTML = 'Lägg till';
      addButton.setAttribute("class","addButtons");
      addButton.setAttribute('id', 'addButton' + item.food + '.' + item.country);
      addButton.onclick = function(){addElementToList(addButton.getAttribute('id'))};
      resultContent.appendChild(addButton);

      // Position the black indicator based on CO2 output
      const carbonOutput = parseFloat(item.carbonOutput);
      const position = Math.min(1.5, Math.max(0, carbonOutput)) / 1.5 * 100;
      const indicator = detailDiv.querySelector('.scale-indicator');
      indicator.style.left = `${position}%`;
      
      resultContent.appendChild(detailDiv);

    });
    
    resultContainer.style.display = 'block'; // Ensure the container is visible
    updateVisibilityClearAllButton(); 
  }
}

/* After clicking the add button the function will respond by adding 
food item as a div to the container (addedByUserDivList) */
function addElementToList(id) {
  const food = id.substr(9);
  i = food.indexOf('.');
  let foodName = food.substr(0, i);
  let foodCountry = food.substr(i+1);

  const foodItemDiv = document.createElement('div'); 
  foodItemDiv.setAttribute("class", "addedFoodItemDiv");
  foodItemDiv.setAttribute("id", food); 
  foodItemDiv.innerHTML =  `<p> ${foodName.concat(" ", foodCountry)} </p>`//getFoodItemFromData(foodName,foodCountry, items); //TODO: 
  const removeButton = document.createElement('button');
  removeButton.setAttribute("class", "removeButtons")
  removeButton.innerHTML = '❌';
  const breakLine = document.createElement('hr');
  breakLine.setAttribute("class","breakLines")
  removeButton.onclick = function(){removeElementFromList(food)} // TODO: 
  foodItemDiv.appendChild(removeButton);
  foodItemDiv.appendChild(breakLine);
  console.log(foodItemDiv.innerHTML);

  // Prevent from adding duplicates
  const foodItem = document.getElementById(food)
  if(!(ListDiv.contains(foodItem))){
    ListDiv.appendChild(foodItemDiv); 
  }
  updateVisibilityClearAllButton();
}

/*Removes an item from the addedByUserList upon button click*/
function removeElementFromList(id) {
  let toRemove = document.getElementById(id);
  toRemove.remove();
  //check if empty, if so hide
  var elements = ListDiv.getElementsByClassName('addedFoodItemDiv');
  if (elements.length == 0) {
    ListDiv.style.display = 'none'
    clearButton.style.display = 'none'; 
  }
}

/* Functionality for rensa-allt button */
function removeAllElementsUser() {

  const parentListDiv = document.getElementById('addedListDiv'); 
  parentListDiv.innerHTML = "";
  ListDiv.style.display = 'none'
  const clearButton = document.getElementById('clearUserList');
  clearButton.style.display = 'none'; 
}

/* Upon clicking the Go to Summary button, user will be taken to summary page  */
function goToSummary() {
  for (const element of ListDiv.getElementsByClassName('addedFoodItemDiv')) {
    const foodCountry = element.getAttribute('id'); 
    i = foodCountry.indexOf('.');
    let name = foodCountry.substr(0, i);
    let country = foodCountry.substr(i+1);
    userList.push({foodName:name, foodCountry:country});
  }
  
  sessionStorage.setItem('userList', JSON.stringify(userList));
  window.location.href="summary_page.html";
}


/* Resultatboxen försvinner när man raderar all text från sökfältet */
function hideResultOnErase(inp) {
  const resultContainer = document.querySelector('.result-container'); // Select result container
  const resultContent = document.getElementById('result'); // Select the result content area

  inp.addEventListener('input', function () {
    if (this.value.trim() === '') {
      resultContent.innerHTML = ''; // Clear results content
      resultContainer.style.display = 'none'; // Hide the result container
      searchedValue = "undefined"

      var elements = ListDiv.getElementsByClassName('addedFoodItemDiv');
      if (elements.length != 0) {
        ListDiv.style.display = 'block';
        updateVisibilityClearAllButton();
      }
    }
  });
}


function updateVisibilityClearAllButton() {
  const listDiv = document.getElementById('addedListDiv');
  const clearButton = document.getElementById('clearUserList');
    if(listDiv.children.length > 0 && listDiv.style.display == 'block'){
      clearButton.style.display = 'block'; 
    } else {
      clearButton.style.display = 'none'; 
    }
}

function handleEnterKeySearch(inp, fullData) {
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const val = inp.value.toLowerCase().trim();

      if (val) {
        searchedValue = val;
        var jsonData = fullData;
        if (filteredJsonData && filteredJsonData !== "null" && filteredJsonData !== "undefined") {
          jsonData = filteredJsonData;
        }
        const matchingItems = jsonData.filter(item =>
          `${item.food} (${item.country})`.toLowerCase().startsWith(val)
        );

        showDetails(matchingItems);
      }
    }
  });
}

updateVisibilityClearAllButton();

fetchFoodData();

const searchBar = document.getElementById('myInput');
const resultSection = document.getElementById('result');
hideResultOnErase(searchBar, resultSection);

// Sorting function 
let isAscending = true;

// Function to sort and display the results
function sortResults() {
  const resultContent = document.getElementById('result');
  const items = Array.from(resultContent.children);

  // Sort items based on carbon output
  items.sort((a, b) => {
    const carbonA = parseFloat(a.querySelector('.food-carbon-output').textContent);
    const carbonB = parseFloat(b.querySelector('.food-carbon-output').textContent);
    return isAscending ? carbonA - carbonB : carbonB - carbonA;
  });

  // Clear existing results and append sorted items
  resultContent.innerHTML = '';
  items.forEach(item => resultContent.appendChild(item));

  // Toggle the sort order for the next click
  isAscending = !isAscending;
}

// Add event listener to the sort button
document.querySelector('.sort-container button').addEventListener('click', sortResults);

/* Skapar landfiltreringsalternativen baserat på data i json*/
function handleCountryDropdown(data){
  const allCountries = [];
  for (const country of data) {
    if (!allCountries.includes(country)) {
      allCountries.push(country);
    }
  }
  const countrySelect = document.getElementById('countries');

  for (const country of allCountries) {
    var newOption = document.createElement('option');
    newOption.value = country;
    newOption.innerHTML = country;
    countrySelect.appendChild(newOption);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('countries').addEventListener('input', handleSelect);
})

/* Filtrerar redan sökta resultat baserat på senaste sökningen */ 
function handleSelect(ev){
  let select = ev.target;
  let selectedCountry = select.value;
  if (allJsonData && allJsonData !== "null" && allJsonData !== "undefined") {
    filteredJsonData = allJsonData;
    if (!(selectedCountry === 'Country')) {
      filteredJsonData = allJsonData.filter(item => `${item.food} (${item.country})`.includes(selectedCountry));
    }
    const resultContainer = document.querySelector('.result-container'); // Select result container
    if (resultContainer.style.display && resultContainer.style.display !== "null" && resultContainer.style.display !== "undefined" && searchedValue !== "undefined"){
      const matchingItems = filteredJsonData.filter(item =>
        `${item.food} (${item.country})`.toLowerCase().includes(searchedValue)
      );
      showDetails(matchingItems);
    }
  }
}