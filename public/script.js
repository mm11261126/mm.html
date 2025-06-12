let currentPokemon = null;

async function sendQuery() {
  const input = document.getElementById('input');
  const query = input.value.trim();
  input.value = '';

  if (!query) return;

  const chat = document.getElementById('chat');
  chat.innerHTML += `<div>你：${query}</div>`;

  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, currentPokemon })
  });

  const data = await res.json();

  if (data.reply) {
    chat.innerHTML += `<div>機器人：${data.reply}</div>`;
  }

  if (data.showTypeChart) {
    chat.innerHTML += `<img src="images/type-chart.png" alt="屬性相剋表" style="max-width: 100%;">`;
  }

  if (data.basicInfo) {
    currentPokemon = data.name;
    chat.innerHTML += `<div>機器人：這是 ${data.name} 的資料</div>`;
    chat.innerHTML += `<img src="${data.image}" alt="${data.name}" style="max-width: 150px;">`;
    chat.innerHTML += `<div>屬性：${data.types}</div>`;
  }

  if (data.moreInfo) {
    if (data.weaknesses) chat.innerHTML += `<div>弱點：${data.weaknesses}</div>`;
    if (data.height) chat.innerHTML += `<div>身高：${data.height}</div>`;
    if (data.weight) chat.innerHTML += `<div>體重：${data.weight}</div>`;
    if (data.abilities) chat.innerHTML += `<div>特性：${data.abilities}</div>`;
  }

  chat.scrollTop = chat.scrollHeight;
}
