const userListSummary = JSON.parse(sessionStorage.getItem('userList'))
const listForHomePage = [];
const listForTODO = [];

let filteredUserData = []; 
let fullData = []; 

function updateUserListForHomepage(foodName,foodCountry){
    listForHomePage.push('summary!!' + foodName + '.' + foodCountry);
} ; 


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

            // console.log('Filtered Data: ', filteredUserData); 
            displayFilteredUserData(filteredUserData, data); 
            updateTotalCarbonOutput(filteredUserData);
            makeListForTODO();
            // substitutionDropdown(filteredUserData, data);
        })
        .catch(error => {
            console.error('Error on summary page', error); 
        }); 
}


// |Namn|Land|Utsläpp|[Input:kg eller liter knappup/knappner (defaultvalue 1kg)]|
// Totala Utsläpp : - kg CO2e/kg (adjust vid ändringar)
function displayFilteredUserData() {
    const summaryTable = document.getElementById('summary-table');
    var perKG = false;
 
    /*For each json row in json data*/
    filteredUserData.forEach((element,index) => {
        //console.log(filteredUserData);
        updateUserListForHomepage(element.food, element.country);

        //check to add right units to table
        perKG = element.raknebas.includes("kg");

        var row = summaryTable.insertRow();

        var foodCell = row.insertCell(0);
        foodCell.innerHTML = element.food;
        
        var countryCell = row.insertCell(1);
        countryCell.innerHTML = element.country;
        
        var carbonOutputCell = row.insertCell(2);
        if (perKG) carbonOutputCell.innerHTML = element.carbonOutput + '/kg';
        else carbonOutputCell.innerHTML = element.carbonOutput + '/L';
        
        var inputCell = row.insertCell(3);
        let inputCellInput = document.createElement('input');
        inputCellInput.setAttribute('class', 'cellInputs');
        inputCellInput.setAttribute('id', element.food + "!" + element.country + ";" + element.carbonOutput);
        inputCellInput.type = 'number';
        inputCellInput.value = 1

        if (perKG) inputCell.innerHTML = 'kg: ';
        else inputCell.innerHTML = 'liter: ';
        
        inputCellInput.addEventListener('input', () => updateTotalCarbonOutput()); 
        inputCell.appendChild(inputCellInput);

        var substitutionCell = row.insertCell(4);
        let substitutionCellContent = document.createElement('select');
        substitutionCellContent.setAttribute('id',"selectSubstitution");

        let substitutionDefualtOption = document.createElement('option');
        substitutionDefualtOption.textContent = "Ersätt med...";
        substitutionCellContent.appendChild(substitutionDefualtOption);
        
        const options = getSubstitutionOptions(element, fullData);

        for (let option of options) {
            // console.log('gello')
            let substitutionCellOption = document.createElement('option'); 
            substitutionCellOption.setAttribute('id',index); // To be used within substitution function
            substitutionCellOption.textContent = option.food + ": " + option.carbonOutput + "kg CO₂e";
            substitutionCellOption.value = option.food +"."+option.country;// To be used within substitution function
            substitutionCellContent.appendChild(substitutionCellOption); 
        }
        substitutionCellContent.addEventListener('input',updateDisplaySubstitution); 
        substitutionCell.appendChild(substitutionCellContent);
        

        
        
     });
     var tableHeader = summaryTable.insertRow(0);
     tableHeader.innerHTML = `
        <th>Mat</th>
        <th>Land</th>
        <th>Utsläpp</th>
        <th>Mängd</th>
        <th>Ersättning</th>
    `;
}

function updateTotalCarbonOutput() {
    //called once in beginning and every time inputCell changed
    //add all carbonOutputCell #s together

    const tableCarbonSum = document.getElementById('carbon-sum');
    const cellInputs = document.getElementsByClassName('cellInputs');
    let totalCarbonOutput = 0;

    for (let inputField of cellInputs) {  
        const foodString = inputField.getAttribute('id');
        const i = foodString.indexOf('!');
        const foodName = foodString.substring(0, i);
        const j = foodString.indexOf(';');
        const foodCountry = foodString.substring(i+1, j);

        // console.log(foodString);
        console.log(foodName);
        
        let carbonOutput = Number.parseFloat(foodString.substring(j+1));
        let amount = parseFloat(inputField.value);

        if (amount === 0) carbonOutput = -1 * carbonOutput; //for subtraction
        totalCarbonOutput += amount * carbonOutput;

        updateListForTODO(foodName, foodCountry, amount);
    }

    tableCarbonSum.textContent = totalCarbonOutput.toFixed(1);
}

function goToHome() {
    sessionStorage.setItem('listFromSummary', JSON.stringify(listForHomePage));
    window.location.href="index.html";
}


fetchFoodData();

//function updataDisplaySubstitution() {} TODO
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
    //alert(foodNameToSub+".."+foodCountryToSub+".."+foodIndexToSub);
    for(let i = 0; i < filteredUserData.length; i++){
        let indicesMatch = foodIndexToSub === i; 
        //alert("I'm here");
        if(indicesMatch ){
            filteredUserData.splice(i,1,substitutionItems[0]);
        }
        
    }
 
    listForHomePage.length = 0; // Empty and then repopulate the list to be sent back to home page to match the current filterdUserData 
    sumTable.innerHTML = ""; 
    displayFilteredUserData(); 
    updateTotalCarbonOutput();
    makeListForTODO();
}
// userListSummary - remove old item, add new, grab new info from data, call displayFilteredUserData

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

function makeListForTODO() {
    //clear list first
    listForTODO.length = 0;

    for (var item of filteredUserData) {
        perKG = item.raknebas.includes("kg");
        const unit = perKG ? " kg":" L";

        if (!listForTODO.includes({name:item.food, country:item.country, amount: 1})) {
            listForTODO.push({name: item.food, country: item.country, amount: 1 + unit});
        }
    }
    // console.log(listForTODO);
}

function updateListForTODO(foodName, foodCountry, foodAmount) {
    for (var item of listForTODO) {
        perKG = item.amount.includes("kg");
        const unit = perKG ? " kg":" L";

        if (foodName === item.name && foodCountry === item.country) {
            item.amount = foodAmount + unit;
        }
    }
}

function goToTODO() {
    sessionStorage.setItem('TODOlist', JSON.stringify(listForTODO));
    window.location.href="todo_page.html";
}
