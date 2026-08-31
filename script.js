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

// Hero CTA button scrolls to the report form
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

// Auto-detect location
const detectBtn = document.getElementById('detectLocationBtn');
const locationInput = document.getElementById('location');
const locationStatus = document.getElementById('locationStatus');

if (detectBtn) {
  detectBtn.addEventListener('click', function () {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    detectBtn.disabled = true;
    detectBtn.textContent = 'Detecting...';
    locationStatus.textContent = 'Fetching your location...';

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        locationInput.value = `${lat}, ${lng}`;
        locationStatus.textContent = 'Location detected successfully.';
        detectBtn.disabled = false;
        detectBtn.textContent = '📍 Detect';
        showLocationOnMap(parseFloat(lat), parseFloat(lng));
      },
      function (error) {
        let message = 'Unable to detect location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow access or type it manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location unavailable. Please type it manually.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Try again.';
        }
        locationStatus.textContent = message;
        detectBtn.disabled = false;
        detectBtn.textContent = '📍 Detect';
      }
    );
  });
}

// Show a small map with a pin at the given coordinates
let map;
let marker;

function showLocationOnMap(lat, lng) {
  const mapDiv = document.getElementById('locationMap');
  mapDiv.classList.add('visible');

  if (!map) {
    map = L.map('locationMap').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map);
  } else {
    map.setView([lat, lng], 15);
    marker.setLatLng([lat, lng]);
  }

  setTimeout(() => map.invalidateSize(), 100);
}

// AI photo classification
let mobilenetModel = null;

async function loadModel() {
  if (!mobilenetModel) {
    console.log('Loading MobileNet model...');
    mobilenetModel = await mobilenet.load();
    console.log('MobileNet model loaded successfully!');
  }
  return mobilenetModel;
}

function mapLabelToCategory(label) {
  const text = label.toLowerCase();

  if (text.includes('manhole') || text.includes('pothole') || text.includes('crack') || text.includes('breakwater') || text.includes('stone wall')) {
    return 'Pothole';
  }
  if (text.includes('trash') || text.includes('garbage') || text.includes('ashcan') || text.includes('waste') || text.includes('bag')) {
    return 'Garbage';
  }
  if (text.includes('streetlight') || text.includes('lamp') || text.includes('light') || text.includes('pole')) {
    return 'Broken Streetlight';
  }
  if (text.includes('water') || text.includes('fountain') || text.includes('hydrant')) {
    return 'Water Leak';
  }
  return 'Other';
}

const photoInput = document.getElementById('photo');
const aiPreviewWrap = document.getElementById('aiPreviewWrap');
const aiPreviewImg = document.getElementById('aiPreviewImg');
const categoryField = document.getElementById('category');

if (photoInput) {
  photoInput.addEventListener('change', async function () {
    console.log('Photo input changed - file selected');
    const file = photoInput.files[0];
    if (!file) return;

       const imageUrl = URL.createObjectURL(file);
    aiPreviewWrap.classList.add('visible');

    async function runClassification() {
      try {
        console.log('Image loaded, running classification...');
        const model = await loadModel();
        const predictions = await model.classify(aiPreviewImg);
        console.log('AI raw guess:', predictions);
        if (predictions && predictions.length > 0) {
          const topGuess = predictions[0].className;
          categoryField.value = mapLabelToCategory(topGuess);
          console.log('Mapped category:', categoryField.value);
        }
      } catch (error) {
        console.error('AI classification failed:', error);
      }
    }

    aiPreviewImg.onload = runClassification;
    aiPreviewImg.src = imageUrl;

    // Fallback: if the image is already loaded/cached, onload may not fire
    if (aiPreviewImg.complete && aiPreviewImg.naturalWidth > 0) {
      runClassification();
    }
  });
} else {
  console.error('Photo input element not found!');
}