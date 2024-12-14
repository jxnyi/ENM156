var userListSummary = [];
const listForHomePage = [];
const listForTODO = [];

let filteredUserData = []; 
let fullData = []; 

window.onload = (_ => {
    let flag = JSON.parse(sessionStorage.getItem('comingFromHomePage'));

    if(flag){
        userListSummary = JSON.parse(sessionStorage.getItem('userList'))
    } else {
        userListSummary = JSON.parse(sessionStorage.getItem('listFromTODO'))
    }
});


function updateDropdownDefaultTextForRow(dropdown, foodName) {
    // Update the "Ersätt med..." text in the dropdown to match the selected ingredient
    if (dropdown && dropdown.options.length > 0) {
        dropdown.options[0].textContent = foodName; // Replace the first option text
    }
}

function updateUserListForHomepage(foodName, foodCountry){
    listForHomePage.push('summary!!' + foodName + '.' + foodCountry);
}


function fetchFoodData() {
    fetch('./foods.json')
        .then(response => {
            if(!response.ok){
                throw new Error ('Could not fetch JSON data');
            }
            return response.json();
        })
        .then(data => {
            fullData = data;
             filteredUserData = data.filter(item =>
                userListSummary.some(filter => 
                    filter.foodName === item.food && filter.foodCountry === item.country
                )
            ); 

            displayFilteredUserData(); 
            updateTotalCarbonOutput();
            makeListForTODO();
        })
        .catch(error => {
            console.error('Error on summary page', error); 
        }); 
}


// |Namn|Land|Utsläpp|[Input:kg eller liter knappup/knappner (defaultvalue 1kg)]|
// Totala Utsläpp : - kg CO2e/kg (adjust vid ändringar)
function displayFilteredUserData() {
    const summaryTable = document.getElementById('summary-table');

    filteredUserData.forEach((element, index) => {
        var row = summaryTable.insertRow();

        // Food Name Cell (Ingrediens)
        var foodCell = row.insertCell(0);
        foodCell.innerHTML = element.food;

        // Country Cell
        var countryCell = row.insertCell(1);
        countryCell.innerHTML = element.country;

        // Carbon Output Cell (Koldioxidutsläpp)
        var carbonOutputCell = row.insertCell(2);
        carbonOutputCell.innerHTML = `${element.carbonOutput} kg CO₂e`;

        // Amount Cell
        // Amount Cell (Mängd)
// Amount Cell (Mängd)
var inputCell = row.insertCell(3);

// Create a container for the unit and input
let inputContainer = document.createElement('div');
inputContainer.classList.add('input-container'); // Add CSS class for styling

// Determine unit (kg or l) based on element.raknebas
let unit = element.raknebas.includes("kg") ? "kg" : "l";

// Create and add the label (unit)
let unitLabel = document.createElement('span');
unitLabel.textContent = `${unit}:`;

// Create and add the input field
let inputCellInput = document.createElement('input');
inputCellInput.setAttribute('class', 'cellInputs');
inputCellInput.type = 'number';
inputCellInput.value = 1;
inputCellInput.addEventListener('input', () => updateTotalCarbonOutput()); // Update total emissions

// Append label and input to the container
inputContainer.appendChild(unitLabel);
inputContainer.appendChild(inputCellInput);

// Append the container to the cell
inputCell.appendChild(inputContainer);



        // Substitution Cell with Dropdown
        var substitutionCell = row.insertCell(4);
        let substitutionCellContent = document.createElement('select');
        substitutionCellContent.setAttribute('class', "selectSubstitutionClass");

        // Default Option
        let substitutionDefaultOption = document.createElement('option');
        substitutionDefaultOption.textContent = "Ersätt med...";
        substitutionCellContent.appendChild(substitutionDefaultOption);

        // Populate Options
        const options = getSubstitutionOptions(element, fullData);
        options.forEach(option => {
            let substitutionCellOption = document.createElement('option');
            substitutionCellOption.textContent = `${option.food}: ${option.carbonOutput} kg CO₂e`;
            substitutionCellOption.value = `${option.food}.${option.country}`;
            substitutionCellContent.appendChild(substitutionCellOption);
        });

        // Event Listener for Dropdown
        substitutionCellContent.addEventListener('input', function () {
            const selectedOptionText = this.options[this.selectedIndex].textContent; // Get selected option text
            const foodName = selectedOptionText.split(':')[0]; // Extract food name (before colon)
            const selectedCarbonOutput = selectedOptionText.split(':')[1]?.trim().split(' ')[0]; // Extract carbonOutput

            // Update Ingrediens column dynamically
            foodCell.innerHTML = foodName;

            // Update Koldioxidutsläpp dynamically
            carbonOutputCell.innerHTML = `${selectedCarbonOutput} kg CO₂e`;
            carbonOutputCell.setAttribute('data-carbon-output', selectedCarbonOutput); // Update stored value

            // Update the dropdown default text dynamically
            updateDropdownDefaultTextForRow(this, foodName);

            // Update the total emissions dynamically
            updateTotalCarbonOutput();
        });

        substitutionCell.appendChild(substitutionCellContent);
    });

    // Add Table Header
    const tableHeader = summaryTable.insertRow(0);
    tableHeader.innerHTML = `
        <th>Ingrediens</th>
        <th>Land</th>
        <th>Koldioxidutsläpp</th>
        <th>Mängd</th>
        <th>Ersättning</th>
    `;
}


function updateTotalCarbonOutput() {
    const tableCarbonSum = document.getElementById('carbon-sum'); // Total emissions display element
    const cellInputs = document.getElementsByClassName('cellInputs'); // Input cells for quantity
    let totalCarbonOutput = 0;

    for (let inputField of cellInputs) {
        const row = inputField.closest('tr'); // Get the corresponding table row
        const carbonOutputCell = row.cells[2]; // Get the Koldioxidutsläpp cell
        const carbonOutput = parseFloat(carbonOutputCell.textContent) || 0; // Extract carbon output
        const amount = parseFloat(inputField.value) || 0; // Get the input value

        totalCarbonOutput += amount * carbonOutput; // Add to total
    }

    tableCarbonSum.textContent = totalCarbonOutput.toFixed(1); // Update total emissions display
}


function goToHome() {
    sessionStorage.setItem('listFromSummary', JSON.stringify(listForHomePage));
    sessionStorage.setItem('comingFromSummaryPage', true);
    window.location.href="index.html";
}


fetchFoodData();

function updateDisplaySubstitution() {
    let sumTable = document.getElementById("summary-table"); 

    // Entry that will replace the current row
    var optionValueSubstitute = this.options[this.selectedIndex].value;
    i = optionValueSubstitute.indexOf('.');
    let foodName = optionValueSubstitute.substr(0, i);
    let foodCountry = optionValueSubstitute.substr(i+1); 

    let substitutionItems = fullData.filter((entry) => {
      return  (entry.food === foodName && entry.country === foodCountry);  
    }); 

    // Entry that needs to be replaced 
    var toBeSubstituted = this.options[this.selectedIndex].id; 
    let foodIndexToSub = parseInt(toBeSubstituted); 

    for(let i = 0; i < filteredUserData.length; i++){
        let indicesMatch = foodIndexToSub === i; 
        if(indicesMatch ){
            filteredUserData.splice(i,1,substitutionItems[0]);
        }
        
    }
 
    console.log('Before: '+listForHomePage);

    listForHomePage.length = 0; // Empty and then repopulate the list to be sent back to home page to match the current filterdUserData 
    sumTable.innerHTML = ""; 
    displayFilteredUserData(); 
    console.log(listForHomePage);

    updateTotalCarbonOutput();
    makeListForTODO();
}

/* Gets the dropdown options for each food item in the summary list in ascending order */
function getSubstitutionOptions(food, fullData) {
    const options = fullData.filter(item => food.category === item.category);

    // Sort options by carbonOutput in ascending order
    const sortedOptions = [];
    for (let option of options) {
        if (!(option.food === food.food && option.country === food.country)) {
            let inserted = false;
            for (let i = 0; i < sortedOptions.length; i++) {
                if (sortedOptions[i].carbonOutput > option.carbonOutput) {
                    sortedOptions.splice(i, 0, option);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                // Add to the end if it's larger than all existing items
                sortedOptions.push(option);
            }
        }
    }

    return sortedOptions;
}

//remake list when page loaded and when substitution made
function makeListForTODO() {
    //clear list first
    listForTODO.length = 0;

    for (var item of filteredUserData) {
        perKG = item.raknebas.includes("kg");
        const unit = perKG ? " kg":" L";

        if (!listForTODO.includes({foodName:item.food, foodCountry:item.country, amount: 1})) {
            listForTODO.push({foodName: item.food, foodCountry: item.country, amount: 1 + unit});
        }
    }
}

//update list every time amount is changed
function updateListForTODO(foodName, foodCountry, foodAmount) {
    for (var item of listForTODO) {
        perKG = item.amount.includes("kg");
        const unit = perKG ? " kg":" L";

        if (foodName === item.foodName && foodCountry === item.foodCountry) {
            item.amount = foodAmount + unit;
        }
    }
}

function goToTODO() {
    sessionStorage.setItem('TODOlist', JSON.stringify(listForTODO));
    window.location.href="todo_page.html";
}
