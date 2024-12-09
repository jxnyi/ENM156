const userListSummary = JSON.parse(sessionStorage.getItem('userList'))
const listForHomePage = []; 

function updateUserListForHomepage(foodName,foodCountry){
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
            const filteredUserData = data.filter(item =>
                userListSummary.some(filter => 
                    filter.foodName === item.food && filter.foodCountry === item.country
                )
            ); 

            console.log('Filtered Data: ', filteredUserData); 
            displayFilteredUserData(filteredUserData); 
            updateTotalCarbonOutput(filteredUserData);
        })
        .catch(error => {
            console.error('Error on summary page', error); 
        }); 
}


// |Namn|Land|Utsläpp|[Input:kg eller liter knappup/knappner (defaultvalue 1kg)]|
// Totala Utsläpp : - kg CO2e/kg (adjust vid ändringar)
function displayFilteredUserData(filteredUserData) {
    const summaryTable = document.getElementById('summary-table');
    var perKG = false;
 
    /*For each json row in json data*/
    filteredUserData.forEach(element => {

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
        inputCellInput.setAttribute('id', element.carbonOutput);
        inputCellInput.type = 'number';
        inputCellInput.value = 1

        if (perKG) inputCell.innerHTML = 'kg: ';
        else inputCell.innerHTML = 'liter: ';
        
        inputCellInput.addEventListener('input', () => updateTotalCarbonOutput()); 

        inputCell.appendChild(inputCellInput);
        
        
     });
     var tableHeader = summaryTable.insertRow(0);
     tableHeader.innerHTML = `
        <th>Mat</th>
        <th>Land</th>
        <th>Utsläpp</th>
        <th>Mängd</th>
    `;
}

function updateTotalCarbonOutput() {
    //called once in beginning and every time inputCell changed
    //add all carbonOutputCell #s together

    const tableCarbonSum = document.getElementById('carbon-sum');
    const cellInputs = document.getElementsByClassName('cellInputs');
    let totalCarbonOutput = 0;

    for (let inputField of cellInputs) {    
        let carbonOutput = Number.parseFloat(inputField.getAttribute('id'));
        let amount = parseFloat(inputField.value);

        if (amount === 0) carbonOutput = -1 * carbonOutput; //for subtraction
        totalCarbonOutput += amount * carbonOutput;
    }

    tableCarbonSum.textContent = totalCarbonOutput.toFixed(1);
}

function goToHome() {
    sessionStorage.setItem('listFromSummary', JSON.stringify(listForHomePage));
    window.location.href="index.html";
}


fetchFoodData();