// Local rule-based recipe finder
document.addEventListener('DOMContentLoaded', function() {
  var pantry = [];
  var allRecipes = [];

  // Elements
  var nameInput    = document.getElementById('ingredient-name');
  var amountInput  = document.getElementById('ingredient-amount');
  var unitSelect   = document.getElementById('ingredient-unit');
  var addBtn       = document.getElementById('add-ingredient-btn');
  var getBtn       = document.getElementById('get-recipes-btn');
  var clearBtn     = document.getElementById('clear-btn');
  var tagsDiv      = document.getElementById('tags');
  var resultsDiv   = document.getElementById('results');

  // Load local recipes.json
  fetch('recipes.json')
    .then(function(res) { return res.json(); })
    .then(function(data) { allRecipes = data; })
    .catch(function(err) { console.error(err); });

  // Render tags
  function renderTags() {
    tagsDiv.innerHTML = '';
    pantry.forEach(function(item, i) {
      var div = document.createElement('div');
      div.className = 'tag';
      div.textContent = item.amount + ' ' + item.unit + ' ' + item.name;
      var span = document.createElement('span');
      span.textContent = '×';
      span.addEventListener('click', function() {
        pantry.splice(i, 1);
        renderTags();
      });
      div.appendChild(span);
      tagsDiv.appendChild(div);
    });
  }

  // Add ingredient
  addBtn.addEventListener('click', function() {
    var n   = nameInput.value.trim().toLowerCase();
    var amt = parseFloat(amountInput.value);
    var u   = unitSelect.value;
    if (!n || isNaN(amt) || amt <= 0) return;
    var exists = pantry.some(function(p) { return p.name === n && p.unit === u; });
    if (!exists) {
      pantry.push({ name: n, amount: amt, unit: u });
      renderTags();
      nameInput.value = '';
      amountInput.value = '';
    }
  });

  // Find exact matches
  getBtn.addEventListener('click', function() {
    resultsDiv.innerHTML = '';
    if (pantry.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">Add at least one ingredient.</p>';
      return;
    }

    var exact = [];
    for (var i = 0; i < allRecipes.length; i++) {
      var recipe = allRecipes[i];
      var ok = true;
      for (var j = 0; j < recipe.ingredients.length; j++) {
        var req = recipe.ingredients[j];
        var found = false;
        for (var k = 0; k < pantry.length; k++) {
          var p = pantry[k];
          if (p.name === req.name && p.unit === req.unit && p.amount >= req.amount) {
            found = true;
            break;
          }
        }
        if (!found) { ok = false; break; }
      }
      if (ok) exact.push(recipe);
    }

    if (exact.length > 0) {
      displayRecipes(exact);
    } else {
      var fallback = generateRuleBasedRecipe(pantry);
      if (fallback) {
        displayGenerated(fallback);
      } else {
        resultsDiv.innerHTML = '<p class="no-recipes">No matching recipes found.</p>';
      }
    }
  });

  // Clear all
  clearBtn.addEventListener('click', function() {
    pantry = [];
    renderTags();
    resultsDiv.innerHTML = '';
  });

  // Display recipes
  function displayRecipes(arr) {
    resultsDiv.innerHTML = '';
    for (var i = 0; i < arr.length; i++) {
      var r = arr[i];
      var card = document.createElement('div');
      card.className = 'recipe';
      var html = '<h3>' + r.title + '</h3><ul>';
      for (var j = 0; j < r.ingredients.length; j++) {
        var ing = r.ingredients[j];
        html += '<li>' + ing.amount + ' ' + ing.unit + ' ' + ing.name + '</li>';
      }
      html += '</ul><p><strong>Steps:</strong></p><ol>';
      for (var k = 0; k < r.steps.length; k++) {
        html += '<li>' + r.steps[k] + '</li>';
      }
      html += '</ol>';
      card.innerHTML = html;
      resultsDiv.appendChild(card);
    }
  }

  // Display generated recipe
  function displayGenerated(rec) {
    resultsDiv.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'recipe';
    var html = '<h3>' + rec.title + '</h3><ul>';
    for (var i = 0; i < rec.ingredients.length; i++) {
      var ing = rec.ingredients[i];
      html += '<li>' + ing.amount + ' ' + ing.unit + ' ' + ing.name + '</li>';
    }
    html += '</ul><p><strong>Steps:</strong></p><ol>';
    for (var j = 0; j < rec.steps.length; j++) {
      html += '<li>' + rec.steps[j] + '</li>';
    }
    html += '</ol>';
    card.innerHTML = html;
    resultsDiv.appendChild(card);
  }

  // Simple rule-based fallback
  function generateRuleBasedRecipe(pantry) {
    var names = [];
    for (var i = 0; i < pantry.length; i++) {
      names.push(pantry[i].name);
    }
    if (names.indexOf('egg') !== -1 && names.indexOf('tomato') !== -1) {
      return {
        title: 'Tomato Egg Scramble (Rule-Based)',
        ingredients: [
          { name: 'egg', amount: 1, unit: 'piece' },
          { name: 'tomato', amount: 0.5, unit: 'piece' }
        ],
        steps: [
          'Beat the egg and chop the tomato.',
          'Heat oil, add tomato and sauté.',
          'Add egg and scramble until cooked.',
          'Season and serve.'
        ]
      };
    }
    if (names.indexOf('egg') !== -1 && names.indexOf('ham') !== -1) {
      return {
        title: 'Ham & Egg Omelette (Rule-Based)',
        ingredients: [
          { name: 'egg', amount: 2, unit: 'piece' },
          { name: 'ham', amount: 50, unit: 'g' }
        ],
        steps: [
          'Beat eggs, season.',
          'Heat butter and pour eggs.',
          'Add ham, fold, and serve.'
        ]
      };
    }
    return null;
  }
});  // <-- This is the final closing parenthesis and semicolon; make sure it's present and aligned.
