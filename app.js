let ingredients = [];
let allRecipes = [];

// Učitaj recepte
fetch('recipes.json')
  .then(r => r.json())
  .then(data => { allRecipes = data; })
  .catch(console.error);

const input = document.getElementById('ingredient-input');
const tagsDiv = document.getElementById('tags');
const resultsDiv = document.getElementById('results');
const clearBtn = document.getElementById('clear-btn');

// Dodavanje tagova
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && input.value.trim()) {
    let tag = input.value.trim().toLowerCase();
    if (!ingredients.includes(tag)) {
      ingredients.push(tag);
      renderTags();
      filterRecipes();
    }
    input.value = '';
  }
});

clearBtn.addEventListener('click', () => {
  ingredients = [];
  renderTags();
  resultsDiv.innerHTML = '';
});

// Prikaz tagova
function renderTags() {
  tagsDiv.innerHTML = '';
  ingredients.forEach((tag, idx) => {
    let div = document.createElement('div');
    div.className = 'tag';
    div.textContent = tag;
    let span = document.createElement('span');
    span.textContent = '×';
    span.onclick = () => { 
      ingredients.splice(idx,1); 
      renderTags(); 
      filterRecipes(); 
    };
    div.append(span);
    tagsDiv.append(div);
  });
}

// Filtriranje recepata
function filterRecipes() {
  if (!ingredients.length) {
    resultsDiv.innerHTML = '';
    return;
  }
  let matches = allRecipes.filter(r =>
    ingredients.every(i => r.tags.includes(i))
  );
  renderRecipes(matches);
}

// Prikaz recepata
function renderRecipes(recipes) {
  resultsDiv.innerHTML = '';
  if (!recipes.length) {
    resultsDiv.textContent = 'Nema recepata za ove sastojke.';
    return;
  }
  recipes.slice(0,5).forEach(r => {
    let div = document.createElement('div');
    div.className = 'recipe';
    div.innerHTML = `
      <img src="${r.image}" alt="${r.title}" />
      <div class="recipe-content">
        <h3>${r.title}</h3>
        <strong>Sastojci:</strong>
        <ul>${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        <strong>Koraci:</strong>
        <ol>${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    `;
    resultsDiv.append(div);
  });
}
