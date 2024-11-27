//constant (container for list of elements added by user)
const ListDiv = document.getElementById("addedListDiv");
ListDiv.style.display = 'none';

/* Hämtar data från foods.json */
async function fetchFoodData() {
  try {
    const response = await fetch('foods.json');
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    const formattedData = data.map(item => `${item.food} (${item.country})`);
    autocomplete(document.getElementById('myInput'), data, formattedData);
    handleEnterKeySearch(document.getElementById('myInput'), data);
  } catch (error) {
    console.error('Error:', error);
  }
}

/* autocomplete för sökfältet */
function autocomplete(inp, fullData, arr) {
  let currentFocus;
  inp.addEventListener('input', function () {
    const val = this.value.toLowerCase();
    closeAllLists();

    if (!val) return false;

    currentFocus = -1;
    const listDiv = document.createElement('div');
    listDiv.setAttribute('id', this.id + 'autocomplete-list');
    listDiv.setAttribute('class', 'autocomplete-items');
    this.parentNode.appendChild(listDiv);

    arr.forEach((item, index) => {
      if (item.toLowerCase().includes(val)) {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<strong>${item.substr(0, val.length)}</strong>${item.substr(val.length)}`;
        itemDiv.addEventListener('click', function () {
          inp.value = item;
          const selectedData = fullData.filter(
            foodItem => `${foodItem.food} (${foodItem.country})`.toLowerCase() === item.toLowerCase()
          );
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
    if (e.keyCode === 40) {
      currentFocus++;
      addActive(items);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(items);
    } else if (e.keyCode === 13) {
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



/* hämta och visa information för sökta livsmedlet, 
also adds add buttons*/
function showDetails(items) {
  const ListDiv = document.getElementById("addedListDiv");
  ListDiv.style.display = 'none';

  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = ''; // Clear previous results

  if (items.length === 0) {
    resultContainer.innerHTML = '<p>Inga resultat hittades.</p>';
  } else {
    items.forEach(item => {
      const detailDiv = document.createElement('div');
      detailDiv.innerHTML = `
        <h3> ${item.food}</h3>
        <p> ${item.country}</p>
        <p> ${item.raknebas}</p>
        <p><strong>Carbon Output:</strong> ${item.carbonOutput} kg CO2e</p>
        <hr />
      `;
      const addButton = document.createElement('button');
      addButton.innerHTML = 'Add';
      addButton.setAttribute("class","addButtons");
      addButton.setAttribute('id', 'addButton' + item.food + '.' + item.country);
      // console.log(addButton.getAttribute("id"));
      //addElementToList(addButton.getAttribute('id'));
      addButton.onclick = function(){addElementToList(addButton.getAttribute('id'), items)};
      resultContainer.appendChild(addButton);
      resultContainer.appendChild(detailDiv);
    });
  }

  resultContainer.style.display = 'block';
  // addButtonCreator(items);
}


/* After clicking the add button the function will respond by adding 
food item as a div to the container (addedByUserDivList) */
function addElementToList(id, items) {
  const food = id.substr(9);
  i = food.indexOf('.');
  let foodName = food.substr(0, i);
  let foodCountry = food.substr(i+1);

  const foodItemDiv = document.createElement('div'); 
  foodItemDiv.setAttribute("class", "addedFoodItemDiv");
  foodItemDiv.setAttribute("id", food); 
  foodItemDiv.innerHTML =  `<p> ${foodName.concat(" ", foodCountry)} </p>`//getFoodItemFromData(foodName,foodCountry, items); //TODO: 
  const removeButton = document.createElement('button');
  removeButton.innerHTML = '❌';
  removeButton.onclick = function(){removeElementFromList(food)} // TODO: 
  foodItemDiv.appendChild(removeButton);
  console.log(foodItemDiv.innerHTML);

  ListDiv.appendChild(foodItemDiv); 
  
  // console.log(foodName);
  // console.log(foodCountry); 

  //const addElementButton = document.getElementById
  //inp.addEventListener('')
}

/*Removes an item from the addedByUserList upon button click*/
function removeElementFromList(id) {
  let toRemove = document.getElementById(id);
  toRemove.remove();
  //check if empty, if so hide
  var elements = ListDiv.getElementsByClassName('addedFoodItemDiv');
      if (elements.length == 0) {
        ListDiv.style.display = 'none'
      }
}

/* Upon clicking the Go to Summary button, user will be taken to summary page  */
function goToSummary() {
  window.location.href="summary_page.html";
}

/* Resultatboxen försvinner när man raderar all text från sökfältet */
function hideResultOnErase(inp, resultSection) {
  inp.addEventListener('input', function () {
    if (this.value.trim() === '') {
      resultSection.style.display = 'none';
      
      //check if emply, if empty do nothing else show
      var elements = ListDiv.getElementsByClassName('addedFoodItemDiv');
      if (elements.length != 0) {
        ListDiv.style.display = 'block'
      }
    }
  });
}

function handleEnterKeySearch(inp, fullData) {
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const val = inp.value.toLowerCase().trim();

      if (val) {
        const matchingItems = fullData.filter(item =>
          `${item.food} (${item.country})`.toLowerCase().includes(val)
        );
        showDetails(matchingItems);
      }
    }
  });
}


fetchFoodData();

const searchBar = document.getElementById('myInput');
const resultSection = document.getElementById('result');
hideResultOnErase(searchBar, resultSection);