// app.js
document.addEventListener('DOMContentLoaded', () => {
  // Karte za prepoznavanje jedinica po nazivu
  const UNIT_MAP = [
    { pattern: /\b(egg|eggs)\b/,     unit: 'piece', step: 1,   ph: 'e.g. 1'   },
    { pattern: /\b(milk|water|broth)\b/, unit: 'ml',   step: 50,  ph: 'e.g. 250' },
    { pattern: /\b(ham|chicken|beef|meat)\b/, unit: 'g',   step: 10,  ph: 'e.g. 100' },
    { pattern: /\b(tomato|cucumber|onion|pepper|carrot)\b/, unit: 'g', step: 10,  ph: 'e.g. 50'  },
    // dodaj po potrebi: fish, rice, beans...
  ];
  const DEFAULT_UNIT = { unit: 'g', step: 10, ph: 'e.g. 100' };

  function inferUnit(name) {
    name = name.toLowerCase();
    for (const m of UNIT_MAP) {
      if (m.pattern.test(name)) return { unit: m.unit, step: m.step, ph: m.ph };
    }
    return DEFAULT_UNIT;
  }

  // Konvertor za bazne jedinice
  const UNIT_CONVERSIONS = {
    g:     { toBase: x => x,          unit: 'g'   },
    ml:    { toBase: x => x,          unit: 'ml'  },
    piece: { toBase: x => x,          unit: 'piece' }
  };

  function normalizePantry(pantry) {
    return pantry.map(({ name, amount, unit }) => {
      const conv = UNIT_CONVERSIONS[unit] || UNIT_CONVERSIONS['g'];
      return { name, amount: conv.toBase(amount), unit: conv.unit };
    });
  }

  // One-Pot recept za fallback
  function makeOnePotRecipe(pantry) {
    const total = pantry.reduce((s, p) => s + p.amount, 0);
    const waterAmt  = Math.ceil(total * 2);
    const saltAmt   = Math.ceil(total / 100) * 2;
    const pepperAmt = Math.ceil(total / 200) * 1;

    return {
      title: 'Universal One-Pot Leftovers',
      ingredients: [
        ...pantry,
        { name: 'water or stock', amount: waterAmt,  unit: 'ml' },
        { name: 'salt',           amount: saltAmt,   unit: 'g'  },
        { name: 'pepper',         amount: pepperAmt, unit: 'g'  }
      ],
      steps: [
        'Combine all your leftover ingredients in a pot.',
        `Pour in about ${waterAmt}ml of water or stock.`,
        'Bring to a boil, then simmer 10–15 minutes.',
        'Season with salt and pepper to taste.',
        'Stir in fresh herbs if available, then serve hot.'
      ]
    };
  }

  // UI elementi
  const nameInput   = document.getElementById('ingredient-name');
  const amountInput = document.getElementById('ingredient-amount');
  const addBtn      = document.getElementById('add-ingredient-btn');
  const getBtn      = document.getElementById('get-recipes-btn');
  const clearBtn    = document.getElementById('clear-btn');
  const tagsDiv     = document.getElementById('tags');
  const resultsDiv  = document.getElementById('results');

  let pantry = [];

  function renderTags() {
    tagsDiv.innerHTML = '';
    pantry.forEach(({ name, amount, unit }, i) => {
      const div = document.createElement('div');
      div.className = 'tag';
      div.textContent = `${amount} ${unit} ${name}`;
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

  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let amt    = parseFloat(amountInput.value);
    if (!name || isNaN(amt) || amt <= 0) return;

    // automatski dodeli relevantnu jedinicu i prilagodi input
    const { unit, step, ph } = inferUnit(name);
    amountInput.step        = step;
    amountInput.placeholder = ph;

    pantry.push({ name, amount: amt, unit });
    nameInput.value   = '';
    amountInput.value = '';
    renderTags();
  });

  getBtn.addEventListener('click', () => {
    resultsDiv.innerHTML = '';
    if (!pantry.length) {
      resultsDiv.innerHTML = '<p class="no-recipes">Add at least one ingredient.</p>';
      return;
    }
    const normPantry = normalizePantry(pantry);
    const recipe     = makeOnePotRecipe(normPantry);
    displayGenerated(recipe);
  });

  clearBtn.addEventListener('click', () => {
    pantry = [];
    renderTags();
    resultsDiv.innerHTML = '';
  });

  function displayGenerated(rec) {
    resultsDiv.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'recipe';
    let html = `<h3>${rec.title}</h3><ul>`;
    rec.ingredients.forEach(ing => {
      html += `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`;
    });
    html += `</ul><p><strong>Steps:</strong></p><ol>`;
    rec.steps.forEach(s => html += `<li>${s}</li>`);
    html += `</ol>`;
    card.innerHTML = html;
    resultsDiv.appendChild(card);
  }
});
