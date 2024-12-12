
function createList(listFromSummary) {
    var TODOlist = document.getElementById("TODO-list");
    console.log(listFromSummary);

    for (const item of listFromSummary) {
        var li = document.createElement("li");

        var itemText = item.name + " (" + item.country + "), " + item.amount;
        var text = document.createTextNode(itemText);
        li.addEventListener('click', function(ev) {
            this.classList.toggle('done');
        }); 
        li.appendChild(text);

        TODOlist.appendChild(li);
    }
}

window.onload = (_ => {
    const listFromSummary = JSON.parse(sessionStorage.getItem('TODOlist'))
    createList(listFromSummary);
});