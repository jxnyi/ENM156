
function createList(listFromSummary) {
    var TODOlist = document.getElementById("TODO-list");
    console.log(listFromSummary);

    for (const item of listFromSummary) {
        var li = document.createElement("li");

        var itemText = item.food + " (" + item.country + ")";//"), " + item.amount;
        // li.setAttribute('id', itemText);
        var text = document.createTextNode(itemText);
        // li.innerHTML = "<li>" + item.food + " (" + item.country + ") </li>";
        li.addEventListener('click', function(ev) {
            this.classList.toggle('done');
            // itemText = "✅ " + this.id;
            // this.text = document.createTextNode(itemText);
            // li.appendChild(text);
        }); 
        li.appendChild(text);

        TODOlist.appendChild(li);
    }
    TODOlist.style.display('block');
}

window.onload = (_ => {
    const listFromSummary = JSON.parse(sessionStorage.getItem('TODOlist'))
    createList(listFromSummary);
});