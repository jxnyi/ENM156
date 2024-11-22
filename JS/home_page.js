
/* Hämtar data från foods.json */
async function fetchFoodData() {
    try {
      const response = await fetch('foods.json');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const formattedData = data.map(item => `${item.food} (${item.country})`);
      autocomplete(document.getElementById('myInput'), data, formattedData);
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
            showDetails(fullData[index]);
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
  }
  
  /* hämta och visa information för sökta livsmedlet */
  function showDetails(item) {
    document.getElementById('food').textContent = item.food;
    document.getElementById('country').textContent = item.country;
    document.getElementById('carbonOutput').textContent = item.carbonOutput + ' kg CO2e';
    document.getElementById('raknebas').textContent = item.raknebas;
    document.getElementById('result').style.display = 'block';
  }
  
  /* Resultatboxen försvinner när man raderar all text från sökfältet */
  function hideResultOnErase(inp, resultSection) {
    inp.addEventListener('input', function () {
      if (this.value.trim() === '') {
        resultSection.style.display = 'none';
      }
    });
  }
  
  fetchFoodData();
  
  const searchBar = document.getElementById('myInput');
  const resultSection = document.getElementById('result');
  hideResultOnErase(searchBar, resultSection);