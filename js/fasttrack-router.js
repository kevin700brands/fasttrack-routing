/// Global HTML
async function globalHtml(content) {
  const html = await fetch("/index.html").then(async (res) => {
    return await res.text();
  });

  const splits = html.split('<div id="content"></div>');

  // removes preloader
  const unhideContent = content.replace(/z-index: 777/g, "z-index: -777");

  const newHtml = `
  <div id="content">${unhideContent}</div> 
  `;

  return splits[0] + newHtml + splits[1];
}

/// Load Script
function loadScript(url, callback) {
  // Create a new script element
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;

  script.onload = function () {
    if (callback) {
      callback();
    }
  };

  // Attach an error event listener for handling script loading errors
  script.onerror = function () {
    console.error("Error loading script from:", url);
  };

  // Append the script to the head of the document
  document.head.appendChild(script);
}

/// Main JS
(function () {
  const urlPageTitle = "JS Single Page Application Router";

  // create document click that watches the nav links only
  document.addEventListener("click", (e) => {
    const { target } = e;
    if (!target.matches("nav a")) {
      return;
    }

    e.preventDefault();
    urlRoute(e);
  });

  // create an object that maps the url to the template, title, and description
  const urlRoutes = {
    404: {
      template: "/404.html",
      title: "404 | " + urlPageTitle,
      description: "Page not found",
    },
    "/": {
      template: "/homepage.html",
      title: "Home | " + urlPageTitle,
      description: "This is the home page",
    },
    "/about.html": {
      page: "about",
      template: "/about.html",
      title: "About Us | " + urlPageTitle,
      description: "This is the about page",
    },
    "/contact.html": {
      page: "contact",
      template: "/contact.html",
      title: "Contact Us | " + urlPageTitle,
      description: "This is the contact page",
    },
  };

  // create a function that watches the url and calls the urlLocationHandler
  function urlRoute(event) {
    if (event) {
      event = event; // get window.event if event argument not provided
      event.preventDefault();
      window.history.pushState({}, "", event.target.href);
    }

    urlLocationHandler();
  }

  // create a function that handles the url location
  async function urlLocationHandler() {
    const location = window.location.pathname; // get the url path

    // if the path length is 0, set it to primary page route
    if (location.length == 0) {
      location = "/";
    }

    // get the route object from the urlRoutes object
    const route = urlRoutes[location] || urlRoutes["404"];

    // get the html from the template
    const html = await fetch(route.template).then(async (response) => {
      //   console.log(await response.text());
      return await response.text();
    });

    const contentEl = document.getElementById("content");

    // Manual adding
    if (!contentEl) {
      await refetch(route);

      return;
    }

    // set the content of the content div to the html
    contentEl.innerHTML = html;
    hidePreloader();
  }

  function hidePreloader() {
    // remove preloaders
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.remove();
    }
  }

  async function refetch(route) {
    imports();

    const wrapper = document.getElementById(route.page);

    // get the html from the template
    const html2 = await fetch(route.template).then(async (response) => {
      return await response.text();
    });

    hidePreloader(); // hides preloader

    wrapper.innerHTML = ""; // clear
    wrapper.insertAdjacentHTML("beforebegin", await globalHtml(html2)); // insert new html
  }

  // All imports here: CDN
  function imports() {
    loadScript("https://cdn.tailwindcss.com", () =>
      console.log("Tailwind Loaded Successfully")
    );
  }

  // add an event listener to the window that watches for url changes
  window.onpopstate = urlLocationHandler;
  // call the urlLocationHandler function to handle the initial url
  window.route = urlRoute;
  // call the urlLocationHandler function to handle the initial url
  urlLocationHandler();
})();
