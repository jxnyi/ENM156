var listFromSummary = [];

//create the TO-DO list
function createList(listFromSummary) {
    var TODOlist = document.getElementById("TODO-list");
    console.log(listFromSummary);

    for (const item of listFromSummary) {
        var li = document.createElement("li");

        var itemText = item.foodName + " (" + item.foodCountry + "), " + item.amount;
        var text = document.createTextNode(itemText);

        var box = document.createElement('input');
        box.setAttribute('type', "checkbox");
        box.setAttribute('id', 'checkbox');

        box.addEventListener('click', function(ev) {
            ev.target.parentNode.classList.toggle('done');
        }); 
        li.appendChild(box);
        li.appendChild(text);

        TODOlist.appendChild(li);
    }
}

window.onload = (_ => {
    listFromSummary = JSON.parse(sessionStorage.getItem('TODOlist'))
    createList(listFromSummary);
});

function goToSummary() {
    sessionStorage.setItem('listFromTODO', JSON.stringify(listFromSummary));
    sessionStorage.setItem('comingFromHomePage', false);

    window.location.href = "summary_page.html";
}