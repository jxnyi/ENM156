// Dynamiskt lägga till innehåll i topbaren
document.addEventListener("DOMContentLoaded", () => {
    const topbar = document.createElement("header");
    topbar.className = "topbar";
    topbar.innerHTML = `
        <div class="logo">SustainaBite</div>
        <nav class="nav-links">
            <a href="#home">Hem</a>
            <a href="#compare">Jämföra Ingredienser</a>
            <a href="#about">Om Oss</a>
        </nav>
    `;
    document.body.insertBefore(topbar, document.body.firstChild);
});
