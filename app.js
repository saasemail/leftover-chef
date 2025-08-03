// app.js – koristi samo TheMealDB sa brzim prikazom, random redosledom i tolerance +2

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

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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

  async function getMealDetails(id) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  }

  async function fetchRecipesQuick(ingredients) {
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

    return Array.from(recipeMap.values()).sort((a, b) => b.matchCount - a.matchCount);
  }

  async function showSuggestions(ingredients, targetDiv) {
    targetDiv.innerHTML = '';

    if (ingredients.length === 0) {
      targetDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    const normalizedInput = ingredients.map(normalize);
    const quickList = await fetchRecipesQuick(normalizedInput);
    if (quickList.length === 0) {
      targetDiv.innerHTML = '<p class="no-recipes">No recipes found for selected combination.</p>';
      return;
    }

    targetDiv.innerHTML = '<p class="no-recipes">Most relevant recipes:</p>';

    const allowed = normalizedInput.concat(allowedExtras);
    const allDetails = await Promise.all(
      quickList.map(async (meal) => {
        const full = await getMealDetails(meal.id);
        if (!full) return null;

        const allIngredients = [];
        for (let i = 1; i <= 20; i++) {
          const ing = full[`strIngredient${i}`];
          if (ing && ing.trim()) {
            allIngredients.push(normalize(ing));
          }
        }

        const extraIngredients = allIngredients.filter(i => !allowed.includes(i));
        return {
          id: meal.id,
          name: meal.name,
          img: meal.img,
          link: `https://www.themealdb.com/meal.php?c=${meal.id}`,
          extraInfo: extraIngredients.length > 0 ? `Includes: + ${extraIngredients.join(', ')}` : '',
          extraCount: extraIngredients.length
        };
      })
    );

    const filtered = allDetails.filter(Boolean);
    const primary = filtered.filter(m => m.extraCount <= 2);
    const fallback = filtered.filter(m => m.extraCount > 2);

    const finalList = primary.length > 0 ? shuffleArray(primary) : shuffleArray(fallback);

    finalList.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'recipe';
      card.innerHTML = `
        <h3>${meal.name}</h3>
        <img src="${meal.img}" alt="${meal.name}" />
        ${meal.extraInfo ? `<p class="extra-info">${meal.extraInfo}</p>` : ''}
        <p><a href="${meal.link}" target="_blank" class="btn">View Recipe</a></p>
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
