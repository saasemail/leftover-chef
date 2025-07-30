document.addEventListener('DOMContentLoaded', function() {
  var pantry = [];
  var apiKey = '87959662f5854a70969bd83e7946b719';

  // DOM elementi
  var nameInput = document.getElementById('ingredient-name');
  var amountInput = document.getElementById('ingredient-amount');
  var unitSelect = document.getElementById('ingredient-unit');
  var addBtn = document.getElementById('add-ingredient-btn');
  var getBtn = document.getElementById('get-recipes-btn');
  var clearBtn = document.getElementById('clear-btn');
  var tagsDiv = document.getElementById('tags');
  var resultsDiv = document.getElementById('results');

  // Prikaz “tagova” unetih sastojaka
  function renderTags() {
    tagsDiv.innerHTML = '';
    for (var i = 0; i < pantry.length; i++) {
      var ing = pantry[i];
      var div = document.createElement('div');
      div.className = 'tag';
      div.textContent = ing.amount + ' ' + ing.unit + ' ' + ing.name;
      var span = document.createElement('span');
      span.textContent = '×';
      (function(index) {
        span.addEventListener('click', function() {
          pantry.splice(index, 1);
          renderTags();
        });
      })(i);
      div.appendChild(span);
      tagsDiv.appendChild(div);
    }
  }

  // Dodavanje sastojka u “pantry”
  addBtn.addEventListener('click', function() {
    var name = nameInput.value.trim().toLowerCase();
    var amount = parseFloat(amountInput.value);
    var unit = unitSelect.value;
    if (!name || isNaN(amount) || amount <= 0) return;
    // Provera duplikata
    for (var j = 0; j < pantry.length; j++) {
      if (pantry[j].name === name && pantry[j].unit === unit) {
        return;
      }
    }
    pantry.push({ name: name, amount: amount, unit: unit });
    renderTags();
    nameInput.value = '';
    amountInput.value = '';
  });

  // Poziv Spoonacular API‑ja za recepte
  getBtn.addEventListener('click', function() {
    resultsDiv.innerHTML = '';
    if (pantry.length === 0) {
      resultsDiv.innerHTML = "<p class='no-recipes'>Add at least one ingredient.</p>";
      return;
    }
    var params = [];
    for (var k = 0; k < pantry.length; k++) {
      var it = pantry[k];
      params.push(encodeURIComponent(it.amount + it.unit + ' ' + it.name));
    }
    var url = 'https://api.spoonacular.com/recipes/findByIngredients?ingredients='
            + params.join(',') + '&number=5&apiKey=' + apiKey;

    fetch(url)
      .then(function(resp) { return resp.json(); })
      .then(function(data) {
        if (!data || data.length === 0) {
          resultsDiv.innerHTML = "<p class='no-recipes'>No suggestions found.</p>";
          return;
        }
        for (var m = 0; m < data.length; m++) {
          var r = data[m];
          var card = document.createElement('div');
          card.className = 'recipe';
          var html = '<img src="' + r.image + '" alt="' + r.title + '">';
          html += '<div class="recipe-content"><h3>' + r.title + '</h3></div>';
          card.innerHTML = html;
          resultsDiv.appendChild(card);
        }
      })
      .catch(function(err) {
        console.error(err);
        resultsDiv.innerHTML = "<p class='no-recipes'>Error fetching recipes.</p>";
      });
  });

  // Briši sve unose
  clearBtn.addEventListener('click', function() {
    pantry = [];
    renderTags();
    resultsDiv.innerHTML = '';
  });
});
