// app.js – koristi lokalne recepte iz pairings.json + API ako treba, sa slikama i linkovima

window.addEventListener('DOMContentLoaded', function () {
  const suggestBtn = document.getElementById('get-recipes-btn');
  const clearBtn = document.getElementById('clear-btn');
  const fridgeList = document.getElementById('fridge-list');
  const clearFridgeBtn = document.getElementById('clear-fridge-btn');
  const useFridgeBtn = document.getElementById('use-fridge-btn');
  const resultsDiv = document.getElementById('results');
  const fridgeResultsDiv = document.getElementById('fridge-results');

  const SMART_FRIDGE_KEY = 'smartFridgeItems';

  const allowedExtras = [
    'salt', 'pepper', 'oil', 'olive oil', 'vegetable oil', 'butter',
    'sugar', 'flour', 'vinegar', 'water', 'garlic', 'onion', 'spices',
    'herbs', 'lemon juice', 'soy sauce', 'milk', 'cream', 'baking powder'
  ];

  function normalize(str) {
    return str.trim().toLowerCase();
  }

  function loadFridge() {
    const items = JSON.parse(localStorage.getItem(SMART_FRIDGE_KEY)) || [];
    fridgeList.innerHTML = '';
    items.forEach(item => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.innerHTML = `<input type="checkbox" value="${item}"> ${item}`;
      fridgeList.appendChild(label);
    });
  }

  function saveToFridge(ingredients) {
    let current = JSON.parse(localStorage.getItem(SMART_FRIDGE_KEY)) || [];
    ingredients.forEach(ing => {
      if (!current.includes(ing)) {
        current.push(ing);
      }
    });
    localStorage.setItem(SMART_FRIDGE_KEY, JSON.stringify(current));
    loadFridge();
  }

  clearFridgeBtn.addEventListener('click', function () {
    localStorage.removeItem(SMART_FRIDGE_KEY);
    fridgeList.innerHTML = '';
    fridgeResultsDiv.innerHTML = '';
  });

  // === LOCAL PAIRINGS ===
  let localRecipes = [];

  fetch('pairings.json')
    .then(res => res.json())
    .then(data => {
      localRecipes = data;
    })
    .catch(err => {
      console.error('Failed to load local pairings:', err);
    });

  function findLocalPairings(ingredients) {
    const normalized = ingredients.map(i => normalize(i));
    return localRecipes.filter(recipe => {
      return recipe.ingredients.every(i => normalized.includes(normalize(i)));
    });
  }

  // === API RECIPE FETCHING ===
  async function getMealDetails(id) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  }

  async function fetchRecipes(ingredients, tolerance = 2) {
    const recipeMap = new Map();

    for (const ingredient of ingredients) {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await res.json();
        if (data.meals) {
          data.meals.forEach(meal => {
            if (!recipeMap.has(meal.idMeal)) {
              recipeMap.set(meal.idMeal, {
                id: meal.idMeal,
                name: meal.strMeal,
                img: meal.strMealThumb,
                matchCount: 1
              });
            } else {
              recipeMap.get(meal.idMeal).matchCount++;
            }
          });
        }
      } catch (err) {
        console.error(`Error fetching recipes for ${ingredient}:`, err);
      }
    }

    const all = Array.from(recipeMap.values()).sort((a, b) => b.matchCount - a.matchCount);
    const filtered = [];

    for (const meal of all) {
      const fullMeal = await getMealDetails(meal.id);
      if (!fullMeal) continue;

      const allIngredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = fullMeal[`strIngredient${i}`];
        if (ing && ing.trim()) {
          allIngredients.push(normalize(ing));
        }
      }

      const allowed = ingredients.map(normalize).concat(allowedExtras);
      const extraIngredients = allIngredients.filter(ing => !allowed.includes(ing));

      if (extraIngredients.length <= tolerance) {
        meal.extraInfo = extraIngredients.length > 0 ? `+ ${extraIngredients.join(', ')}` : '';
        filtered.push(meal);
      }

      if (filtered.length >= 20) break;
    }

    return filtered;
  }

  async function showSuggestions(ingredients, targetDiv) {
    targetDiv.innerHTML = '';

    if (ingredients.length === 0) {
      targetDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    // prvo probaj lokalno
    const localMatches = findLocalPairings(ingredients);

    if (localMatches.length > 0) {
      targetDiv.innerHTML = '<p class="no-recipes">Suggested quick pairings:</p>';
      localMatches.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recipe';
        card.innerHTML = `
          <h3>${rec.title}</h3>
          ${rec.img ? `<img src="${rec.img}" alt="${rec.title}" />` : ''}
          <p>${rec.tip}</p>
          ${rec.link ? `<p><a href="${rec.link}" target="_blank" class="btn">View Recipe</a></p>` : ''}
        `;
        targetDiv.appendChild(card);
      });
      return;
    }

    // ako nema lokalno, koristi API
    let results = await fetchRecipes(ingredients, 2);

    if (results.length === 0) {
      results = await fetchRecipes(ingredients, 4);
      if (results.length > 0) {
        targetDiv.innerHTML = '<p class="no-recipes">Showing best available matches with extra ingredients:</p>';
      } else {
        targetDiv.innerHTML = '<p class="no-recipes">No recipes found for selected combination.</p>';
        return;
      }
    }

    results.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'recipe';
      card.innerHTML = `
        <h3>${meal.name}</h3>
        <img src="${meal.img}" alt="${meal.name}" />
        ${meal.extraInfo ? `<p class="extra-info">Includes: ${meal.extraInfo}</p>` : ''}
        <p><a href="https://www.themealdb.com/meal.php?c=${meal.id}" target="_blank" class="btn">View Recipe</a></p>
      `;
      targetDiv.appendChild(card);
    });
  }

  suggestBtn.addEventListener('click', function () {
    const selectedEls = document.querySelectorAll('#quiz-area input[type="checkbox"]:checked');
    const selected = Array.from(selectedEls).map(cb => cb.value.trim());
    saveToFridge(selected);
    showSuggestions(selected, resultsDiv);
  });

  clearBtn.addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('#quiz-area input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    resultsDiv.innerHTML = '';
  });

  useFridgeBtn.addEventListener('click', function () {
    const selectedFridge = document.querySelectorAll('#fridge-list input[type="checkbox"]:checked');
    const ingredients = Array.from(selectedFridge).map(cb => cb.value.trim());
    showSuggestions(ingredients, fridgeResultsDiv);
  });

  loadFridge();
});
