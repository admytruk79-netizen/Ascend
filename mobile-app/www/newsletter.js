(function () {
  const ENDPOINT = 'https://br-fragrant-credit-ae8lw8hs-newsletter.compute.c-2.us-east-2.aws.neon.tech/';
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('newsletterEmail');
  const companyInput = document.getElementById('newsletterCompany');
  const submitButton = document.getElementById('newsletterSubmit');
  const status = document.getElementById('newsletterStatus');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !emailInput.validity.valid) {
      status.textContent = 'Enter a valid email address.';
      emailInput.focus();
      return;
    }

    submitButton.disabled = true;
    status.textContent = 'Signing you up…';
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company: companyInput.value }),
      });
      if (!response.ok) throw new Error('signup_failed');
      emailInput.value = '';
      status.textContent = 'You’re on the list. Welcome.';
    } catch (error) {
      status.textContent = 'Could not sign you up right now. Please try again.';
    } finally {
      submitButton.disabled = false;
    }
  });
})();
