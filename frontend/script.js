const API_BASE = 'http://localhost:5000/api';
const container = document.getElementById('card-container');
let currentMovie = null;

// Load next unseen movie card
async function loadNext() {
  const res = await fetch(`${API_BASE}/movies/next`);
  if (!res.ok) {
    container.innerHTML = '<p>No more movies to swipe.</p>';
    return;
  }
  const movie = await res.json();
  currentMovie = movie;

  const card = document.createElement('div');
  card.className = 'card';
  card.style.backgroundImage = `url(${movie.poster})`;
  card.innerHTML = `<h2>${movie.title}</h2>`;

  container.innerHTML = '';
  container.append(card);
  makeSwipeable(card);
}

// Attach pointer-based swipe logic
function makeSwipeable(card) {
  let startX = 0;
  card.onpointerdown = e => {
    startX = e.clientX;
    card.setPointerCapture(e.pointerId);
  };
  card.onpointermove = e => {
    if (e.pressure === 0) return;
    const dx = e.clientX - startX;
    card.style.transform = `translateX(${dx}px) rotate(${dx/10}deg)`;
  };
  card.onpointerup = async e => {
    const dx = e.clientX - startX;
    const watched = dx > 100;   // right swipe = watched
    if (Math.abs(dx) > 100) {
      await fetch(`${API_BASE}/movies/swipe`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...currentMovie, watched })
      });
      loadNext();
    } else {
      card.style.transform = '';  // reset position
    }
  };
}

// Fetch AI recommendations
document.getElementById('recs-btn').onclick = async () => {
  const res = await fetch(`${API_BASE}/recommendations`);
  const text = await res.text();
  document.getElementById('recs-output').textContent = text;
};

// Kick things off
loadNext();
