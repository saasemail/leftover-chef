let ingredients = [];
let allRecipes = [];

fetch('recipes.json')
  .then(r => r.json())
  .then(data => { allRecipes = data; })
  .catch(console.error);

const input = document.getElementById('ingredient-input');
const getBtn = document.getElementById('get-recipe-btn');
const clearBtn = document.getElementById('clear-btn');
const tagsDiv = document.getElementById('tags');
const resultsDiv = document.getElementById('results');

// Dodaj tag na Enter
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    e.preventDefault();
    const tag = input.value.trim().toLowerCase();
    if (ingredients.length < 5 && !ingredients.includes(tag)) {
      ingredients.push(tag);
      renderTags();
    }
    input.value = '';
  }
});

// Filtriraj recepte na klik
getBtn.addEventListener('click', () => {
  resultsDiv.innerHTML = '';

  if (ingredients.length < 2) {
    resultsDiv.innerHTML = '<p class="no-recipes">Please add at least two ingredients to get recipes.</p>';
    return;
  }

  const matches = allRecipes.filter(r =>
    // tražimo recepte koji sadrže sve unete sastojke
    ingredients.every(i => r.tags.includes(i))
  );

  if (!matches.length) {
    resultsDiv.innerHTML = '<p class="no-recipes">No recipes found for these ingredients.</p>';
    return;
  }

  matches.slice(0, 5).forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe';
    card.innerHTML = `
      <img src="${r.image}" alt="${r.title}">
      <div class="recipe-content">
        <h3>${r.title}</h3>
        <p><strong>Ingredients:</strong></p>
        <ul>${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        <p><strong>Steps:</strong></p>
        <ol>${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <button class="share-btn">Share Recipe</button>
        <div class="share-options">
          <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-x-twitter"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-facebook"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-tiktok"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-viber"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-telegram"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-whatsapp"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-reddit"></i></a>
        </div>
      </div>
    `;
    resultsDiv.append(card);

    const shareBtn = card.querySelector('.share-btn');
    const shareBox = card.querySelector('.share-options');
    shareBtn.addEventListener('click', () => {
      shareBox.classList.toggle('visible');
    });
  });
});

// Očisti sve tagove
clearBtn.addEventListener('click', () => {
  ingredients = [];
  renderTags();
  resultsDiv.innerHTML = '';
});

// Render tagova ispod input polja
function renderTags() {
  tagsDiv.innerHTML = '';
  ingredients.forEach((tag, i) => {
    const div = document.createElement('div');
    div.className = 'tag';
    div.textContent = tag;
    const span = document.createElement('span');
    span.textContent = '×';
    span.onclick = () => {
      ingredients.splice(i, 1);
      renderTags();
    };
    div.append(span);
    tagsDiv.append(div);
  });
}
