function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  nav.classList.toggle('active');
  hamburger.classList.toggle('open');
}

async function showMessage(event) {
  event.preventDefault();
  const msg = document.getElementById('form-message');
  const form = event.target;
  const name = form.querySelector('input[type="text"]').value.trim();
  const email = form.querySelector('input[type="email"]').value.trim();
  const message = form.querySelector('textarea').value.trim();

  if (!name || !email || !message) {
    msg.style.display = 'block';
    msg.textContent = 'Please fill in all fields.';
    msg.style.color = 'red';
    return;
  }

  try {
    const response = await fetch('https://home-tuition-truelearning-2hcl.onrender.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();
    if (response.ok) {
      msg.style.display = 'block';
      msg.textContent = data.message || 'Your message has been sent successfully!';
      msg.style.color = 'green';
      form.reset();
    } else {
      msg.style.display = 'block';
      msg.textContent = data.message || 'Failed to send message.';
      msg.style.color = 'red';
    }
  } catch (error) {
    msg.style.display = 'block';
    msg.textContent = 'Server error. Please try again later.';
    msg.style.color = 'red';
  }

  setTimeout(() => { msg.style.display = 'none'; }, 5000);
}
