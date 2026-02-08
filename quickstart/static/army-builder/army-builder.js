const pool = document.getElementById("unit-pool");
const roster = document.getElementById("army-roster");
const rosterCount = document.getElementById("roster-count");
const rosterCost = document.getElementById("roster-cost");
const rosterEmpty = document.getElementById("roster-empty");

let dragged = null;

const updateRosterStats = () => {
  const cards = roster.querySelectorAll(".army-builder__card");
  const totalCost = Array.from(cards).reduce((sum, card) => {
    return sum + Number(card.dataset.cost || 0);
  }, 0);

  rosterCount.textContent = String(cards.length);
  rosterCost.textContent = String(totalCost);
  rosterEmpty.style.display = cards.length ? "none" : "block";
};

const addDragHandlers = (card) => {
  card.addEventListener("dragstart", () => {
    dragged = card;
    card.classList.add("is-dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("is-dragging");
    dragged = null;
    roster.classList.remove("is-active");
  });
};

const enableDropZone = (container, { allowClone }) => {
  container.addEventListener("dragover", (event) => {
    event.preventDefault();
    container.classList.add("is-active");
  });

  container.addEventListener("dragleave", () => {
    container.classList.remove("is-active");
  });

  container.addEventListener("drop", (event) => {
    event.preventDefault();
    container.classList.remove("is-active");

    if (!dragged) {
      return;
    }

    const target = event.target.closest(".army-builder__list");
    if (!target) {
      return;
    }

    if (allowClone) {
      const clone = dragged.cloneNode(true);
      clone.classList.remove("is-dragging");
      clone.setAttribute("draggable", "true");
      addDragHandlers(clone);
      roster.appendChild(clone);
    } else {
      roster.appendChild(dragged);
    }

    updateRosterStats();
  });
};

pool.querySelectorAll(".army-builder__card").forEach(addDragHandlers);

enableDropZone(pool, { allowClone: false });
enableDropZone(roster, { allowClone: true });

updateRosterStats();
