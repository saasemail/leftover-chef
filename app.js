// app.js – koristi TheMealDB za recepte + Smart Fridge + selekcija iz frižidera

window.addEventListener('DOMContentLoaded', function () {
  const suggestBtn = document.getElementById('get-recipes-btn');
  const clearBtn = document.getElementById('clear-btn');
  const fridgeList = document.getElementById('fridge-list');
  const clearFridgeBtn = document.getElementById('clear-fridge-btn');
  const useFridgeBtn = document.getElementById('use-fridge-btn');
  const resultsDiv = document.getElementById('results');
  const fridgeResultsDiv = document.getElementById('fridge-results');

  const SMART_FRIDGE_KEY = 'smartFridgeItems';

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

  async function fetchRecipes(ingredients) {
    const recipeMap = new Map();

    for (const ingredient of ingredients) {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await res.json();
        if (data.meals) {
          data.meals.forEach(meal => {
            if (recipeMap.has(meal.idMeal)) {
              recipeMap.get(meal.idMeal).matchCount++;
            } else {
              recipeMap.set(meal.idMeal, {
                id: meal.idMeal,
                name: meal.strMeal,
                img: meal.strMealThumb,
                matchCount: 1
              });
            }
          });
        }
      } catch (err) {
        console.error(`Error fetching recipes for ${ingredient}:`, err);
      }
    }

    const sorted = Array.from(recipeMap.values())
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 5);

    return sorted;
  }

  async function showSuggestions(ingredients, targetDiv) {
    targetDiv.innerHTML = '';

    if (ingredients.length === 0) {
      targetDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    const results = await fetchRecipes(ingredients);

    if (results.length === 0) {
      targetDiv.innerHTML = '<p class="no-recipes">No recipes found for selected combination.</p>';
      return;
    }

    results.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'recipe';
      card.innerHTML = `
        <h3>${meal.name}</h3>
        <img src="${meal.img}" alt="${meal.name}" />
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
