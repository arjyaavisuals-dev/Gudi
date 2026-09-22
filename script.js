const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Keeps the conversation so far, in the format Gemini expects.
let history = [];

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  const loadingEl = addMessage('Thinking...', 'bot loading');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history })
    });

    const data = await response.json();

    loadingEl.remove();

    if (!response.ok) {
      addMessage(`Error: ${data.error || 'Something went wrong'}`, 'bot');
      sendBtn.disabled = false;
      return;
    }

    addMessage(data.reply, 'bot');

    // Update history with this exchange so the bot remembers context.
    history.push({ role: 'user', parts: [{ text }] });
    history.push({ role: 'model', parts: [{ text: data.reply }] });

  } catch (err) {
    loadingEl.remove();
    addMessage('Error: could not reach server.', 'bot');
  }

  sendBtn.disabled = false;
  userInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

