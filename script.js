// Smooth scroll for nav links
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Hero CTA button also scrolls to the form (in case it's used elsewhere)
const ctaBtn = document.querySelector('.hero .cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', function (e) {
    if (this.getAttribute('href') === '#report') {
      e.preventDefault();
      document.querySelector('#report').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Handle the report form submission
const reportForm = document.getElementById('reportForm');
const formStatus = document.getElementById('formStatus');

if (reportForm) {
  reportForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    formStatus.textContent = 'Submitting...';
    formStatus.className = '';

    const formData = new FormData(reportForm);

    try {
      const response = await fetch(reportForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formStatus.textContent = '✅ Thank you! Your report has been submitted.';
        formStatus.className = 'success';
        reportForm.reset();
      } else {
        formStatus.textContent = '❌ Something went wrong. Please try again.';
        formStatus.className = 'error';
      }
    } catch (error) {
      formStatus.textContent = '❌ Network error. Please try again.';
      formStatus.className = 'error';
    }
  });
}