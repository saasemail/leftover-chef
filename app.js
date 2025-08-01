// app.js
document.addEventListener('DOMContentLoaded', function() {
  // --- Konverzija jedinica ---
  const UNIT_CONVERSIONS = {
    g:     { toBase: amt => amt,          unit: 'g'   },
    kg:    { toBase: amt => amt * 1000,   unit: 'g'   },
    ml:    { toBase: amt => amt,          unit: 'ml'  },
    l:     { toBase: amt => amt * 1000,   unit: 'ml'  },
    piece: { toBase: amt => amt,          unit: 'piece' }
  };

  function normalizePantry(pantry) {
    return pantry.map(({ name, amount, unit }) => {
      const conv = UNIT_CONVERSIONS[unit];
      return {
        name,
        amount: conv.toBase(amount),
        unit: conv.unit
      };
    });
  }

  // --- One-Pot fallback ---
  function makeOnePotRecipe(pantry) {
    // suma svih količina (u baznim jedinicama)
    const total = pantry.reduce((sum, p) => sum + p.amount, 0);
    const waterAmt = total * 2; // duplo više tečnosti
    const saltAmt  = Math.ceil(total / 100) * 2;   // ~2g soli na 100g
    const pepperAmt= Math.ceil(total / 200) * 1;   // ~1g bibera na 200g

    return {
      title: 'Universal One-Pot Leftovers',
      ingredients: [
        ...pantry.map(p => ({ name: p.name, amount: p.amount, unit: p.unit })),
        { name: 'water or stock', amount: waterAmt,    unit: 'ml'    },
        { name: 'salt',           amount: saltAmt,     unit: 'g'     },
        { name: 'pepper',         amount: pepperAmt,   unit: 'g'     }
      ],
      steps: [
        'Combine all your leftover ingredients in a pot.',
        `Pour in about ${waterAmt}ml of water or stock (roughly twice the volume).`,
        'Bring to a boil, then reduce heat and simmer 10–15 minutes.',
        'Season with salt and pepper to taste.',
        'Stir in fresh herbs if available, then serve hot.'
      ]
    };
  }

  // --- Glavni kod ---
  let pantry = [];
  let allRecipes = [];  // ne koristimo za MVP

  // Elements
  const nameInput   = document.getElementById('ingredient-name');
  const amountInput = document.getElementById('ingredient-amount');
  const unitSelect  = document.getElementById('ingredient-unit');
  const addBtn      = document.getElementById('add-ingredient-btn');
  const getBtn      = document.getElementById('get-recipes-btn');
  const clearBtn    = document.getElementById('clear-btn');
  const tagsDiv     = document.getElementById('tags');
  const resultsDiv  = document.getElementById('results');

  // Render tagove
  function renderTags() {
    tagsDiv.innerHTML = '';
    pantry.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'tag';
      div.textContent = `${item.amount} ${item.unit} ${item.name}`;
      const span = document.createElement('span');
      span.textContent = '×';
      span.addEventListener('click', () => {
        pantry.splice(i, 1);
        renderTags();
      });
      div.appendChild(span);
      tagsDiv.appendChild(div);
    });
  }

  // Dodaj sastojak
  addBtn.addEventListener('click', () => {
    const name  = nameInput.value.trim().toLowerCase();
    const amt   = parseFloat(amountInput.value);
    const unit  = unitSelect.value;
    if (!name || isNaN(amt) || amt <= 0) return;
    pantry.push({ name, amount: amt, unit });
    nameInput.value = '';
    amountInput.value = '';
    renderTags();
  });

  // Get Recipes
  getBtn.addEventListener('click', () => {
    resultsDiv.innerHTML = '';
    if (pantry.length === 0) {
      resultsDiv.innerHTML = '<p class="no-recipes">Add at least one ingredient.</p>';
      return;
    }

    // Normalize
    const normPantry = normalizePantry(pantry);

    // Fallback One-Pot
    const recipe = makeOnePotRecipe(normPantry);
    displayGenerated(recipe);
  });

  // Clear All
  clearBtn.addEventListener('click', () => {
    pantry = [];
    renderTags();
    resultsDiv.innerHTML = '';
  });

  // Prikaz generisanog recepta
  function displayGenerated(rec) {
    resultsDiv.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'recipe';
    let html = `<h3>${rec.title}</h3><ul>`;
    rec.ingredients.forEach(ing => {
      html += `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`;
    });
    html += `</ul><p><strong>Steps:</strong></p><ol>`;
    rec.steps.forEach(step => {
      html += `<li>${step}</li>`;
    });
    html += `</ol>`;
    card.innerHTML = html;
    resultsDiv.appendChild(card);
  }
});
