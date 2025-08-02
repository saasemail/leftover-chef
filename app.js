// Instant Flavor Pairing: simple quiz logic

window.addEventListener('DOMContentLoaded', function() {
  var pairings = [];

  // Load static pairings.json
  fetch('pairings.json')
    .then(function(response) { return response.json(); })
    .then(function(data) { pairings = data; })
    .catch(function(error) { console.error('Error loading pairings:', error); });

  // UI elements
  var suggestBtn = document.getElementById('get-recipes-btn');
  var clearBtn   = document.getElementById('clear-btn');
  var resultsDiv = document.getElementById('results');

  // Suggest event
  suggestBtn.addEventListener('click', function() {
    // Clear previous results
    resultsDiv.innerHTML = '';

    // Collect selected ingredients
    var selectedEls = document.querySelectorAll('#quiz-area input[type="checkbox"]:checked');
    var selected = Array.prototype.map.call(selectedEls, function(cb) { return cb.value; });

    if (selected.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">Select at least one ingredient.</p>';
      return;
    }

    // Filter pairings that include all selected ingredients
    var matches = pairings.filter(function(item) {
      return selected.every(function(ing) {
        return item.ingredients.indexOf(ing) !== -1;
      });
    });

    // Choose a suggestion or fallback
    var suggestion;
    if (matches.length > 0) {
      suggestion = matches[Math.floor(Math.random() * matches.length)];
    } else {
      suggestion = {
        title: 'Quick Snack',
        tip: 'Combine your ingredients, drizzle with olive oil, season, and enjoy!'
      };
    }

    // Display the suggestion
    var card = document.createElement('div');
    card.className = 'recipe';
    card.innerHTML = '<h3>' + suggestion.title + '</h3><p>' + suggestion.tip + '</p>';
    resultsDiv.appendChild(card);
  });

  // Clear selection and results
  clearBtn.addEventListener('click', function() {
    var checkboxes = document.querySelectorAll('#quiz-area input[type="checkbox"]');
    checkboxes.forEach(function(cb) { cb.checked = false; });
    resultsDiv.innerHTML = '';
  });
});
