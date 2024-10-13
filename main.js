// This function do the functionality dynamically for all Drop Menu
function setupMenuToggle(
  menuToggleSelector,
  menuLinksSelector,
  activeClass = "active"
) {
  const menuToggle = document.querySelector(menuToggleSelector);
  const menuLinks = document.querySelector(menuLinksSelector);

  if (!menuToggle || !menuLinks) {
    console.error("Invalid selectors provided for menuToggle or menuLinks.");
    return;
  }

  menuToggle.addEventListener("click", (event) => {
    menuLinks.classList.toggle(activeClass);
    event.stopPropagation();
  });

  // Close the menu when clicking outside of it
  document.addEventListener("click", (event) => {
    if (
      menuLinks.classList.contains(activeClass) &&
      !menuLinks.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      menuLinks.classList.remove(activeClass);
    }
  });
}

// Usage of setupMenuToggle function
setupMenuToggle(".menu", ".nav-links");
setupMenuToggle(".fav-btn", ".all-fav");
// End of setupMenuToggle function

// Start Card function //
const card = function (obj, viewMode) {
  // Added viewMode parameter
  // root element
  if (!obj || !obj.image || !obj.image.medium) {
    return; // Exit if show is invalid
  }
  const rowDiv = document.querySelector(".row");

  // create elements
  let bootStrapDiv = document.createElement("div");
  let cardDiv = document.createElement("div");
  let showInfoDiv = document.createElement("div");
  let infoDiv = document.createElement("div");
  let tagsDiv = document.createElement("div");
  let aboutDiv = document.createElement("div");
  let con = document.createElement("div");
  let showImage = document.createElement("img");
  let showNameSpan = document.createElement("span");
  let ratingSpan = document.createElement("span");
  let favSpan = document.createElement("span");
  let heartIcon = document.createElement("i");

  // handling img url
  let imgUrl = obj.image ? obj.image.original : obj.image.medium; // Handle cases where image is missing

  // Limiting genres to 3
  for (let i = 0; i < obj.genres.length && i < 3; i++) {
    let genresItem = document.createElement("span");
    genresItem.textContent = obj.genres[i];
    tagsDiv.appendChild(genresItem);
  }

  // Extract the first paragraph from the summary
  let summaryHtml = obj.summary || "No description available"; // Handle missing summary
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = summaryHtml;

  // Find the first <p> tag in the parsed HTML
  let firstParagraph = tempDiv.querySelector("p");
  aboutDiv.innerHTML = firstParagraph
    ? firstParagraph.outerHTML
    : "No description available";

  // append children
  rowDiv.appendChild(bootStrapDiv);
  bootStrapDiv.appendChild(cardDiv);
  cardDiv.appendChild(showImage);
  cardDiv.appendChild(showInfoDiv);
  showInfoDiv.appendChild(infoDiv);
  infoDiv.appendChild(showNameSpan);
  infoDiv.appendChild(con);
  con.appendChild(ratingSpan);
  con.appendChild(favSpan);
  favSpan.appendChild(heartIcon);
  showInfoDiv.appendChild(tagsDiv);
  showInfoDiv.appendChild(aboutDiv);

  // add content to elements
  showNameSpan.textContent = obj.name;
  ratingSpan.textContent =
    obj.rating?.average != null ? obj.rating.average : "N/A";

  // add classes to elements
  rowDiv.classList.add("row");
  bootStrapDiv.classList.add(
    "col-xl-3",
    "col-lg-4",
    "col-md-6",
    "col-sm-12",
    "mb-4",
    "g-style"
  );

  cardDiv.classList.add("show-card");
  showInfoDiv.classList.add("show-info");
  infoDiv.classList.add("info");
  showNameSpan.classList.add("show-name");
  con.classList.add("fav");
  favSpan.classList.add("favorite");
  heartIcon.classList.add("fa-solid", "fa-heart");
  ratingSpan.classList.add("rating");
  tagsDiv.classList.add("tags");
  aboutDiv.classList.add("about");

  // add attributes
  favSpan.setAttribute("data-show-id", obj.id);
  showImage.setAttribute("src", imgUrl);
  showImage.setAttribute("alt", obj.name || "Show Image");
  showImage.setAttribute("data-id", obj.id);

  // Apply styles based on the current view mode
  if (viewMode === "list") {
    cardDiv.classList.add("list-view");
    bootStrapDiv.classList.remove("col-xl-3", "col-lg-4", "col-md-6", "mb-4");
    bootStrapDiv.classList.add("col-12", "mb-3");
  } else {
    cardDiv.classList.remove("list-view");
    bootStrapDiv.classList.add("col-xl-3", "col-lg-4", "col-md-6", "mb-4");
    bootStrapDiv.classList.remove("col-12", "mb-3");
  }
};
// END Card function //

// Fetching data from TVmaze
let originalShowsList = [];
let showsList = []; // Store all the fetched shows
let highestRatingList = [];
let lowestRatingList = [];
let page = 0; // Local pagination for loaded data
const limit = 15; // Number of shows to load per page
let isLoading = false; // To prevent multiple fetch requests

const container = document.querySelector(".row");
const highestRating = document.querySelector("#highest");
const lowestRating = document.querySelector("#lowest");

// Fetch all TV shows from the API
async function fetchAllShows() {
  try {
    const url = `https://api.tvmaze.com/shows`;
    const response = await axios.get(url);
    originalShowsList = response.data; // Store all shows
    showsList = [...originalShowsList];
    // Filter and sort the highest and lowest rated shows
    highestRatingList = showsList
      .filter(
        (e) => e.rating.average !== null && e.rating.average !== undefined
      )
      .sort((a, b) => b.rating.average - a.rating.average);

    lowestRatingList = showsList
      .filter(
        (e) => e.rating.average !== null && e.rating.average !== undefined
      )
      .sort((a, b) => a.rating.average - b.rating.average);

    renderShows("grid"); // Initially render the default batch in grid view
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}
function setupImageClickEvent() {
  const container = document.querySelector(".movies-container"); // Ensure this is the correct container

  container.addEventListener("click", (event) => {
    const image = event.target.closest("img"); // Use closest to ensure we get the right image
    if (image) {
      const showId = image.getAttribute("data-id");
      handleImageClick(showId);
    }
  });
}

// Function to render and append more data (15 TV shows at a time)
function renderShows(viewMode) {
  if (isLoading) return; // Prevent multiple requests while loading
  isLoading = true; // Set loading flag to true

  // Get the appropriate list based on the active class
  const activeList = getActiveShows();

  // Get the next batch of shows to render based on the page
  const start = page * limit;
  const end = start + limit;
  const limitedShows = activeList.slice(start, end);

  // Append the fetched data to the container
  limitedShows.forEach((show) => {
    card(show, viewMode); // Pass the current viewMode to the card function
  });

  page++;
  isLoading = false; // Reset loading flag after the fetch is complete
}

// Determine which list to display based on the active class
function getActiveShows() {
  if (highestRating.classList.contains("active")) {
    return highestRatingList;
  } else if (lowestRating.classList.contains("active")) {
    return lowestRatingList;
  }
  return showsList; // Default case if no button is active
}

// Add active class to one button at a time and update the shows accordingly
function toggleActiveRating(element, otherElement) {
  element.addEventListener("click", (event) => {
    // Toggle active class
    const isActive = element.classList.toggle("active");
    if (isActive) {
      otherElement.classList.remove("active");
    }

    container.innerHTML = ""; // Clear the container
    page = 0; // Reset page number

    // Determine the current view mode based on the active classes
    const currentViewMode = gridStyle.classList.contains("active")
      ? "grid"
      : "list";

    // Render the shows based on the current active button
    renderShows(currentViewMode);

    event.stopPropagation();
  });
}

// Add event listeners for grid and list view buttons
const gridStyle = document.querySelector(".grid");
const listStyle = document.querySelector(".list");
gridStyle.classList.add("active");

gridStyle.addEventListener("click", function () {
  if (!gridStyle.classList.contains("active")) {
    // Set grid view active
    gridStyle.classList.add("active");
    // Remove active class from list view button
    listStyle.classList.remove("active");

    // Reset the column classes for grid view
    document.querySelectorAll(".g-style").forEach((style) => {
      style.classList.remove("col-12", "mb-3");
      style.classList.add(
        "col-xl-3",
        "col-lg-4",
        "col-md-6",
        "col-sm-12",
        "mb-4"
      );
    });

    // Render shows in grid view
    container.innerHTML = ""; // Clear the container
    page = 0; // Reset page number
    renderShows("grid");
  }
});

listStyle.addEventListener("click", function () {
  if (!listStyle.classList.contains("active")) {
    // Set list view active
    listStyle.classList.add("active");
    // Remove active class from grid view button
    gridStyle.classList.remove("active");

    // Reset the column classes for list view
    document.querySelectorAll(".g-style").forEach((style) => {
      style.classList.add("col-12", "mb-3");
      style.classList.remove("col-xl-3", "col-lg-4", "col-md-6", "mb-4");
    });

    // Render shows in list view
    container.innerHTML = ""; // Clear the container
    page = 0; // Reset page number
    renderShows("list");
  }
});

let isSearchActive = false; // Flag to track search activity

// Event listener for infinite scrolling
window.addEventListener("scroll", () => {
  if (!isSearchActive) {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      renderShows(gridStyle.classList.contains("active") ? "grid" : "list");
    }
  }
});

// Initially load all the shows
fetchAllShows().then(() => {
  applyFavoriteStatus();
});
// Toggle between highest and lowest rating lists
toggleActiveRating(highestRating, lowestRating);
toggleActiveRating(lowestRating, highestRating);

// Search form event listener
const form = document.querySelector(".search-form");
const errorMsg = document.querySelector(".warning");
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const searchInput = form.elements.q.value.trim();

  if (searchInput === "") {
    errorMsg.innerText = "";
    errorMsg.innerText = `Search Input can not be empty`;
    errorMsg.style.display = "block";
    return;
  }

  try {
    // Fetch search results from TVmaze API
    const config = { params: { q: searchInput } };
    const res = await axios.get(`https://api.tvmaze.com/search/shows?`, config);
    const searchQuery = res.data;
    errorMsg.style.display = "none";
    searchOrFilter(searchQuery, errorMsg);
  } catch (error) {
    console.error("Error fetching search results:", error.message);
  }
});

function searchOrFilter(data, errorMsg) {
  isSearchActive = true;

  // Clear the container before displaying search results
  container.innerHTML = "";

  // Update showsList with search results
  showsList = data.map((result) => result.show).filter((show) => show); // Filter out any undefined shows
  if (showsList.length === 0) {
    errorMsg.innerText = "";
    errorMsg.innerText = `Invalid Search`;
    errorMsg.style.display = "block";
  }

  // Update highest and lowest rating lists based on the new search results
  highestRatingList = showsList
    .filter(
      (show) =>
        show.rating &&
        show.rating.average !== null &&
        show.rating.average !== undefined
    )
    .sort((a, b) => b.rating.average - a.rating.average);

  lowestRatingList = showsList
    .filter(
      (show) =>
        show.rating &&
        show.rating.average !== null &&
        show.rating.average !== undefined
    )
    .sort((a, b) => a.rating.average - b.rating.average);

  // Get the current view mode (grid or list)
  const currentViewMode = gridStyle.classList.contains("active")
    ? "grid"
    : "list";

  // Loop through the search results and display them
  showsList.forEach((show) => {
    // Ensure the show has the required properties before calling card
    if (show && show.name) {
      // Check for show existence and name
      card(show, currentViewMode);
    } else {
      console.log("ERROR");
    }
  });

  // If no results, reset the search flag
  if (showsList.length === 0) {
    errorMsg.innerText = "";
    errorMsg.innerText = `No results found`;
    errorMsg.style.display = "block";
    isSearchActive = false;
  }

  // Handle cases of no valid shows
  if (showsList.length > 1) {
    if (highestRatingList.length === 0) {
      errorMsg.innerText = "";
      errorMsg.innerText = `No shows with valid ratings found for lowest ratings or highest ratings.`;
      errorMsg.style.display = "block";
    }
    if (lowestRatingList.length === 0) {
      errorMsg.innerText = "";
      errorMsg.innerText = `No shows with valid ratings found for lowest ratings or highest ratings.`;
      errorMsg.style.display = "block";
    }
  }
}
// Event listener for search input clear/reset
form.elements.q.addEventListener("input", function (e) {
  if (e.target.value.trim() === "") {
    // Reset search flag if the input is cleared
    isSearchActive = false;
    container.innerHTML = ""; // Clear the container
    errorMsg.style.display = "none";
    page = 0; // Reset pagination
    fetchAllShows().then(() => {
      applyFavoriteStatus();
    });
  }
});

// Function to handle what happens when the image is clicked
function handleImageClick(showId) {
  const show = showsList.find((show) => show.id == showId);
  if (!show.image) {
    return; // Skip rendering this card if there's no image
  }
  const {
    name: showName = "N/A",
    genres = [],
    network = {},
    premiered = "N/A",
    ended = "N/A",
    rating = { average: "N/A" },
    status = "N/A",
    summary = "No Current Summary Available ",
  } = show;

  const { name: netWorkName = "N/A", country = {} } = network;
  const countryName = country.name || "N/A";

  const container = document.querySelector(".overlay");
  // Create Elements
  const currentMovieInfoDiv = document.createElement("div");
  const showImageDiv = document.createElement("div");
  const activeShowDiv = document.createElement("div");
  const headerDiv = document.createElement("div");
  const ratingDiv = document.createElement("div");
  const genresDiv = document.createElement("div");
  const scrollContainerDiv = document.createElement("div");
  const infoDiv = document.createElement("div");
  const summaryDiv = document.createElement("div");

  const showImage = document.createElement("img");
  const imageUrl = show.image
    ? show.image.original || show.image.medium
    : "defaultImage.jpg";
  showImage.setAttribute("src", imageUrl);
  showImage.setAttribute("alt", showName || "Show Image");

  const showNameH2 = document.createElement("h2");
  const ratingSpan = document.createElement("span");
  const favSpan = document.createElement("span");
  const heartI = document.createElement("i");
  const infoH3 = document.createElement("h3");
  const infoUl = document.createElement("ul");
  const netWorkNameLi = document.createElement("li");
  const countryNameLi = document.createElement("li");
  const premieredLi = document.createElement("li");
  const endedLi = document.createElement("li");
  const statusLi = document.createElement("li");
  const netWorkNameSpan = document.createElement("span");
  const countryNameSpan = document.createElement("span");
  const premieredSpan = document.createElement("span");
  const endedSpan = document.createElement("span");
  const statusSpan = document.createElement("span");
  const summaryPara = document.createElement("p");
  // add classes to Elements
  currentMovieInfoDiv.classList.add("current-movie-info");
  showImageDiv.classList.add("show-image");
  activeShowDiv.classList.add("current-show-info");
  headerDiv.classList.add("header");
  ratingDiv.classList.add("rating");
  genresDiv.classList.add("genres");
  scrollContainerDiv.classList.add("scroll-container");
  infoDiv.classList.add("info");
  summaryDiv.classList.add("summary");
  showNameH2.classList.add("display-6");
  showNameH2.classList.add("show-name");
  favSpan.classList.add("favorite");
  heartI.classList.add("fa-solid", "fa-heart");
  favSpan.setAttribute("data-show-id", showId);
  // ------showId
  const checkHeart = document.querySelector(`[data-id="${showId}"]`);
  const parentElement = checkHeart.parentElement;
  if (
    parentElement.querySelector(".fa-heart").classList.contains("favorited")
  ) {
    heartI.classList.add("favorited");
  }
  // Appending Childrens to Elements
  container.appendChild(currentMovieInfoDiv);
  currentMovieInfoDiv.appendChild(showImageDiv);
  currentMovieInfoDiv.appendChild(activeShowDiv);
  showImageDiv.appendChild(showImage);
  activeShowDiv.appendChild(headerDiv);
  activeShowDiv.appendChild(genresDiv);
  activeShowDiv.appendChild(scrollContainerDiv);
  headerDiv.appendChild(showNameH2);
  headerDiv.appendChild(ratingDiv);
  ratingDiv.appendChild(ratingSpan);
  ratingDiv.appendChild(favSpan);
  favSpan.appendChild(heartI);

  genres.forEach((genre) => {
    let genresItem = document.createElement("span");
    genresItem.textContent = genre;
    genresDiv.appendChild(genresItem);
  });

  scrollContainerDiv.appendChild(infoDiv);
  scrollContainerDiv.appendChild(summaryDiv);
  infoDiv.appendChild(infoH3);
  infoDiv.appendChild(infoUl);
  infoUl.appendChild(netWorkNameLi);
  infoUl.appendChild(countryNameLi);
  infoUl.appendChild(premieredLi);
  infoUl.appendChild(endedLi);
  infoUl.appendChild(statusLi);

  // Add InnerTexr , textContent , InnerHtml
  netWorkNameLi.textContent = "Network: ";
  netWorkNameLi.appendChild(netWorkNameSpan);

  countryNameLi.textContent = "Country: ";
  countryNameLi.appendChild(countryNameSpan);

  premieredLi.textContent = "Premiered: ";
  premieredLi.appendChild(premieredSpan);

  endedLi.textContent = "Ended: ";
  endedLi.appendChild(endedSpan);

  statusLi.textContent = "Status: ";
  statusLi.appendChild(statusSpan);

  summaryDiv.appendChild(summaryPara);

  showNameH2.innerText = showName;
  ratingSpan.innerText = rating.average;
  infoH3.innerText = "Info";
  netWorkNameSpan.textContent = netWorkName;
  countryNameSpan.textContent = countryName;
  premieredSpan.textContent = premiered;
  endedSpan.textContent = ended;
  statusSpan.textContent = status;
  summaryPara.innerHTML = summary;

  container.style.display = "flex";
}

//  close current opened show
const containerOverlay = document.querySelector(".overlay");
const currentShow = document.querySelector(".current-movie-info");
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) {
    containerOverlay.style.display = "none";
    containerOverlay.innerHTML = "";
  }
  applyFavoriteStatus();
});
setupImageClickEvent();

// Favorite

function toggleFavorite(showId, showTitle, showImg) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Check if the show is already in favorites
  const index = favorites.findIndex((fav) => fav.id === showId);

  if (index > -1) {
    // If it's already in favorites, remove it
    favorites.splice(index, 1);
    UiAddOrRemove(`${showTitle} removed from favorites.`);
  } else {
    // Otherwise, add it to favorites
    favorites.push({ id: showId, title: showTitle, image: showImg });
    UiAddOrRemove(`${showTitle} added to favorites.`);
  }

  // Save the updated favorites list back to localStorage
  localStorage.setItem("favorites", JSON.stringify(favorites));

  // Update the favorite list UI
  makeFavList(favorites);
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("fa-heart")) {
    const showId = event.target
      .closest(".favorite")
      .getAttribute("data-show-id");
    const showTitle = event.target
      .closest(".show-card, .current-show-info")
      .querySelector(".show-name").textContent;
    const showImg = event.target
      .closest(".show-card, .current-movie-info")
      .querySelector("img")
      .getAttribute("src");
    toggleFavorite(showId, showTitle, showImg);

    event.target.classList.toggle("favorited");
  }
});

// Apply favorite status to heart icons on page load
function applyFavoriteStatus() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  document.querySelectorAll(".favorite").forEach((favElement) => {
    const showId = favElement.getAttribute("data-show-id");
    const heartIcons = favElement.querySelectorAll(".fa-heart");

    heartIcons.forEach((heartIcon) => {
      if (favorites.some((fav) => fav.id === showId)) {
        heartIcon.classList.add("favorited");
      } else {
        heartIcon.classList.remove("favorited");
      }
    });
  });
}

// Create and render favorite list UI
function makeFavList(favorites) {
  const favListContainer = document.querySelector(".fav-list");
  favListContainer.innerHTML = ""; // Clear the list before adding new items
  for (const favItem of favorites) {
    const favItemDiv = document.createElement("div");
    const favImage = document.createElement("img");
    const favInfoDiv = document.createElement("div");
    const showNameSpan = document.createElement("span");

    favItemDiv.classList.add("fav-item");
    favInfoDiv.classList.add("info");

    favImage.setAttribute("src", favItem.image);
    showNameSpan.innerText = favItem.title;

    favListContainer.appendChild(favItemDiv);
    favItemDiv.appendChild(favImage);
    favItemDiv.appendChild(favInfoDiv);
    favInfoDiv.appendChild(showNameSpan);
  }
}

// Initial call to render favorite list when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  makeFavList(favorites);
  applyFavoriteStatus();
});

// Listen for changes in localStorage across tabs
window.addEventListener("storage", (event) => {
  if (event.key === "favorites") {
    const updatedFavorites = JSON.parse(event.newValue) || [];
    makeFavList(updatedFavorites);
  }
});

// UI added or removed item from fav list
function UiAddOrRemove(title) {
  const addOrRemoveMsg = document.querySelector(".fav-add-remove");
  addOrRemoveMsg.innerText = title;

  addOrRemoveMsg.classList.remove("show-msg-none");
  addOrRemoveMsg.classList.add("show-msg");
  setTimeout(() => {
    addOrRemoveMsg.classList.remove("show-msg");
    addOrRemoveMsg.classList.add("show-msg-none");
  }, 2500);
}
