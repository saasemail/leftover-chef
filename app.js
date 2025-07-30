document.addEventListener("DOMContentLoaded", function() {
  var pantry = [];
  var allRecipes = [];

  // DOM elementi
  var input = document.getElementById("ingredient-input");
  var getBtn = document.getElementById("get-recipe-btn");
  var clearBtn = document.getElementById("clear-btn");
  var tagsDiv = document.getElementById("tags");
  var resultsDiv = document.getElementById("results");

  // Učitaj recepte
  fetch("recipes.json")
    .then(function(res) { return res.json(); })
    .then(function(data) { allRecipes = data; })
    .catch(function(err) { console.error("Failed to load recipes:", err); });

  // Parsiranje unosa: "0.5 tomato" ili fallback
  function parseEntry(text) {
    var parts = text.trim().split(/\s+/);
    var amount = parseFloat(parts[0]);
    var unit, name;
    if (!isNaN(amount) && parts.length > 1) {
      unit = parts[1];
      name = parts.slice(2).join(" ");
    } else {
      amount = 1;
      unit = "piece";
      name = text.trim();
    }
    return {
      name: name.toLowerCase(),
      amount: amount,
      unit: unit.toLowerCase()
    };
  }

  // Iscrtavanje tagova
  function renderTags() {
    tagsDiv.innerHTML = "";
    pantry.forEach(function(item, idx) {
      var tag = document.createElement("div");
      tag.className = "tag";
      tag.textContent = item.amount + " " + item.unit + " " + item.name;
      var span = document.createElement("span");
      span.textContent = "×";
      span.addEventListener("click", function() {
        pantry.splice(idx, 1);
        renderTags();
      });
      tag.appendChild(span);
      tagsDiv.appendChild(tag);
    });
  }

  // Provera da li recept može da se napravi
  function canMake(recipe) {
    return recipe.ingredients.every(function(req) {
      var have = pantry.find(function(p) {
        return p.name === req.name && p.unit === req.unit && p.amount >= req.amount;
      });
      return Boolean(have);
    });
  }

  // Dodaj u pantry na Enter
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && input.value.trim() !== "") {
      e.preventDefault();
      var item = parseEntry(input.value);
      var dup = pantry.some(function(p) {
        return p.name === item.name && p.unit === item.unit;
      });
      if (pantry.length < 10 && !dup) {
        pantry.push(item);
        renderTags();
      }
      input.value = "";
    }
  });

  // Prikaži recepte
  getBtn.addEventListener("click", function() {
    resultsDiv.innerHTML = "";
    if (pantry.length < 2) {
      resultsDiv.innerHTML = "<p class='no-recipes'>Please add at least two ingredients with amounts.</p>";
      return;
    }
    var matches = allRecipes.filter(canMake);
    if (matches.length === 0) {
      resultsDiv.innerHTML = "<p class='no-recipes'>No recipes found for these ingredients.</p>";
      return;
    }
    matches.forEach(function(recipe) {
      var card = document.createElement("div");
      card.className = "recipe";
      var html = "";
      html += "<img src=\"" + recipe.image + "\" alt=\"" + recipe.title + "\">";
      html += "<div class=\"recipe-content\">";
      html += "<h3>" + recipe.title + "</h3>";
      html += "<p><strong>Ingredients:</strong></p>";
      html += "<ul>";
      recipe.ingredients.forEach(function(i) {
        html += "<li>" + i.amount + " " + i.unit + " " + i.name + "</li>";
      });
      html += "</ul>";
      html += "<p><strong>Steps:</strong></p>";
      html += "<ol>";
      recipe.steps.forEach(function(s) {
        html += "<li>" + s + "</li>";
      });
      html += "</ol>";
      html += "</div>";
      card.innerHTML = html;
      resultsDiv.appendChild(card);
    });
  });

  // Clear all
  clearBtn.addEventListener("click", function() {
    pantry = [];
    renderTags();
    resultsDiv.innerHTML = "";
  });
});
