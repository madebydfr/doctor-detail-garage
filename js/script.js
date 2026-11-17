// Carry the chosen package into the contact page and prepare an email locally.
const form = document.querySelector("#contact-form");
if (form) {
  const service = form.elements.namedItem("service");
  const selected = new URLSearchParams(window.location.search).get("package");
  if ([...service.options].some(option => option.value === selected)) {
    service.value = selected;
  }
  const button = form.querySelector("button[type=submit]");
  const emailLink = document.querySelector("#email-request");
  const status = document.querySelector("#request-status");
  button.disabled = false;
  form.addEventListener("input", () => {
    emailLink.hidden = true;
    emailLink.removeAttribute("href");
    status.textContent = "";
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const request = form.elements.namedItem("request-type");
    const subject = `${request.selectedOptions[0].textContent} — Doctor Detail Garage`;
    const body = [
      `Name: ${fields.get("name")}`,
      `Email: ${fields.get("email")}`,
      `Phone: ${fields.get("phone") || "Not provided"}`,
      `Package: ${service.selectedOptions[0].textContent}`,
      "", String(fields.get("comments"))
    ].join("\n");
    emailLink.href = `mailto:doctordetailgarage@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    emailLink.hidden = false;
    status.textContent = "Your email is ready to open. Nothing has been sent. If your email app does not open, email doctordetailgarage@gmail.com directly.";
  });
}

const slideshow = document.querySelector(".slideshow");

if (slideshow) {
  const slides = slideshow.querySelectorAll("img");
  let currentSlide = 0;

  function updateSlides() {
    const total = slides.length;
    const previous = (currentSlide - 1 + total) % total;
    const next = (currentSlide + 1) % total;

    slides.forEach((slide, index) => {
      const isPreview = index === previous || index === next;
      const isVisible = index === currentSlide || isPreview;

      slide.classList.toggle("is-current", index === currentSlide);
      slide.classList.toggle("is-previous", index === previous);
      slide.classList.toggle("is-next", index === next);

      // Let visitors select previews with a mouse or keyboard.
      slide.tabIndex = isPreview ? 0 : -1;
      slide.setAttribute("aria-hidden", String(!isVisible));

      if (isPreview) {
        slide.setAttribute("role", "button");
        slide.setAttribute(
          "aria-label",
          `Show ${index === previous ? "previous" : "next"} photo: ${slide.alt}`
        );
      } else {
        slide.removeAttribute("role");
        slide.removeAttribute("aria-label");
      }
    });
  }

  function selectSlide(index) {
    const slide = slides[index];

    if (
      !slide.classList.contains("is-previous") &&
      !slide.classList.contains("is-next")
    ) {
      return;
    }

    const hadFocus = document.activeElement === slide;

    currentSlide = index;
    updateSlides();

    // Keep keyboard focus on the selected photo.
    if (hadFocus) {
      slide.focus();
    }
  }

  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      selectSlide(index);
    });

    slide.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSlide(index);
      }
    });
  });

  updateSlides();
}
// Reviews saved in this browser.
const reviewStorageKey = "doctor-detail-reviews";

function readReviews() {
  const saved = JSON.parse(
    localStorage.getItem(reviewStorageKey) || "[]"
  );

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter((review) => {
    return (
      review &&
      typeof review.name === "string" &&
      typeof review.message === "string" &&
      Number.isInteger(review.rating) &&
      review.rating >= 1 &&
      review.rating <= 5
    );
  });
}

// Display reviews on the homepage.
const reviewsContainer = document.querySelector("#customer-reviews");

if (reviewsContainer) {
  try {
    const reviews = readReviews();

    if (reviews.length === 0) {
      reviewsContainer.textContent =
        "No reviews saved in this browser yet. Share your experience!";
    }

    reviews.forEach((review) => {
      const card = document.createElement("article");
      card.className = "review-card";

      const name = document.createElement("h3");
      name.textContent = review.name;

      const rating = document.createElement("p");
      rating.className = "review-rating";
      rating.textContent =
        "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      rating.setAttribute("aria-label", `${review.rating} out of 5 stars`);

      const message = document.createElement("p");
      message.className = "review-message";
      message.textContent = review.message;

      card.append(name, rating, message);
      reviewsContainer.append(card);
    });
  } catch {
    reviewsContainer.textContent =
      "Reviews could not be loaded in this browser.";
  }
}

// Save a review from the review page.
const reviewForm = document.querySelector("#review-form");

if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const status = document.querySelector("#review-status");
    const name = reviewForm.elements.namedItem("name").value.trim();
    const message = reviewForm.elements.namedItem("message").value.trim();
    const rating = Number(
      reviewForm.elements.namedItem("rating").value
    );

    if (
      !name ||
      !message ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      status.textContent = "Please enter your name, rating, and review.";
      return;
    }

    try {
      const reviews = readReviews();

      reviews.unshift({ name, rating, message });

      localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));

      reviewForm.reset();
      status.textContent =
        "Your review was saved in this browser. Visit the homepage to see it.";
    } catch {
      status.textContent =
        "Your review could not be saved. Browser storage may be unavailable.";
    }
  });
}