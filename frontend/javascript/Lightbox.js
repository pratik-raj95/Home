const galleryImages = document.querySelectorAll('.gallery-grid img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeBtn');

galleryImages.forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
  });
});

// Close on button click
closeBtn.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

// Close when clicking outside the image
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.style.display = 'none';
  }
});


const btn = document.getElementById("showMoreBtn");
  const images = document.querySelectorAll(".gallery-grid img");
  let isExpanded = false;

  btn.addEventListener("click", () => {
    if (!isExpanded) {
      images.forEach(img => img.style.display = "block");
      btn.textContent = "Show Less";
      isExpanded = true;
    } else {
      images.forEach((img, index) => {
        if (index >= 5) img.style.display = "none";  // sirf 6 dikhaye
      });
      btn.textContent = "Show More";
      isExpanded = false;
    }
  });