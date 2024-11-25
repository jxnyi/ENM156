
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

/* hämta och visa information för sökta livsmedlet */
function showDetails(items) {
  const resultContainer = document.querySelector('.result-container'); // Select result container
  const resultContent = document.getElementById('result'); // Select the result content area
  const template = document.getElementById('result-template'); // Access the template

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

      resultContent.appendChild(detailDiv);
    });

    resultContainer.style.display = 'block'; // Ensure the container is visible
  }
}

/* Resultatboxen försvinner när man raderar all text från sökfältet */
function hideResultOnErase(inp) {
  const resultContainer = document.querySelector('.result-container'); // Select result container
  const resultContent = document.getElementById('result'); // Select the result content area

  inp.addEventListener('input', function () {
    if (this.value.trim() === '') {
      resultContent.innerHTML = ''; // Clear results content
      resultContainer.style.display = 'none'; // Hide the result container
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