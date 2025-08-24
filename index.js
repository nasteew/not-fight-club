const content = document.getElementById("content");     // основной контент
const container = document.querySelector(".container"); // контейнер для регистрации
const pageName = document.querySelector(".page-name");

const defaultContent = content.innerHTML;
const defaultContentContainer = container.innerHTML
function navigate(page, addToHistory = true) {

  if (page === "home") {
    content.innerHTML = defaultContent;
    pageName.textContent = "Home";
  }
  else if (page === "index"){
    container.innerHTML = defaultContentContainer;
  } 
  else {
    fetch(`${page}.html`)
      .then(response => {
        if (!response.ok) throw new Error("Страница не найдена");
        return response.text();
      })
      .then(html => {
        content.innerHTML = html;
        if (page !== "register") {
          pageName.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        }
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Ошибка: ${err.message}</p>`;
      });
  }

  if (addToHistory) {
    const url = page === "home" ? "/" : `/${page}`;
    history.pushState({ page }, "", url);
  }
}
document.body.addEventListener("click", e => {
  if (e.target.closest(".header-nav a")) {
    e.preventDefault();
    const page = e.target.closest("a").dataset.page;
    navigate(page);
  }
});

document.addEventListener("DOMContentLoaded", () => {
 if (!localStorage.getItem("username")) {
      window.location.href = "register.html";
    }
});



//ДЛЯ КОНТЕНТА
content.addEventListener("click", e => {
  if (e.target.classList.contains("fight-button")) {
    navigate("battle");
  }
});

window.addEventListener("popstate", e => {
  if (e.state && e.state.page) {
    navigate(e.state.page, false);
  }
});