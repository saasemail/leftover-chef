// Instant Flavor Pairing: fetch real recipes from TheMealDB

window.addEventListener('DOMContentLoaded', function() {
  const suggestBtn = document.getElementById('get-recipes-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultsDiv = document.getElementById('results');

  suggestBtn.addEventListener('click', function () {
    resultsDiv.innerHTML = '';

    const selectedEls = document.querySelectorAll('#quiz-area input[type="checkbox"]:checked');
    const selected = Array.from(selectedEls).map(cb => cb.value.trim());

    if (selected.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    const query = selected.join(',');

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`)
      .then(res => res.json())
      .then(data => {
        if (!data.meals || data.meals.length === 0) {
          resultsDiv.innerHTML = '<p class="no-recipes">No recipes found for that combination.</p>';
          return;
        }

        // Show top 3 results
        data.meals.slice(0, 3).forEach(meal => {
          const card = document.createElement('div');
          card.className = 'recipe';
          card.innerHTML = `
            <h3>${meal.strMeal}</h3>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
            <p><a href="https://www.themealdb.com/meal.php?c=${meal.idMeal}" target="_blank" class="btn">View Recipe</a></p>
          `;
          resultsDiv.appendChild(card);
        });
      })
      .catch(error => {
        console.error('API error:', error);
        resultsDiv.innerHTML = '<p class="no-recipes">Error fetching recipes. Try again later.</p>';
      });
  });

  clearBtn.addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('#quiz-area input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    resultsDiv.innerHTML = '';
  });
});
