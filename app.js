// app.js – koristi TheMealDB za recepte

window.addEventListener('DOMContentLoaded', function() {
  const suggestBtn = document.getElementById('get-recipes-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultsDiv = document.getElementById('results');

  suggestBtn.addEventListener('click', async function () {
    resultsDiv.innerHTML = '';

    const selectedEls = document.querySelectorAll('#quiz-area input[type="checkbox"]:checked');
    const selected = Array.from(selectedEls).map(cb => cb.value.trim());

    if (selected.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    const recipeMap = new Map();

    for (const ingredient of selected) {
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

    const sortedRecipes = Array.from(recipeMap.values())
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 5);

    if (sortedRecipes.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">No recipes found for selected combination.</p>';
      return;
    }

    sortedRecipes.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'recipe';
      card.innerHTML = `
        <h3>${meal.name}</h3>
        <img src="${meal.img}" alt="${meal.name}" />
        <p><a href="https://www.themealdb.com/meal.php?c=${meal.id}" target="_blank" class="btn">View Recipe</a></p>
      `;
      resultsDiv.appendChild(card);
    });
  });

  clearBtn.addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('#quiz-area input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    resultsDiv.innerHTML = '';
  });
});
