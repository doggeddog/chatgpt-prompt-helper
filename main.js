// ==UserScript==
// @name         ChatGPT-Prompt-Helper
// @namespace    https://github.com/doggeddog/chatgpt-prompts-helper
// @author       doggeddog
// @homepageURL  https://github.com/doggeddog/chatgpt-prompts-helper
// @version      1.1.1
// @description  Show prompts for ChatGPT
// @match        https://chat.openai.com/*
// @match        https://bard.google.com/*
// @match        https://poe.com/*
// @match        https://waaao.com/*
// @connect      raw.githubusercontent.com
// @downloadURL  https://raw.githubusercontent.com/doggeddog/chatgpt-prompt-helper/master/main.js
// @updateURL    https://raw.githubusercontent.com/doggeddog/chatgpt-prompt-helper/master/main.js
// @grant        GM_addStyle
// ==/UserScript==

// 如果你用了其他第三方的网站可以在复制第五行，然后粘贴在下面继续添加自己的网站 @match https://chat.openai.com/*

(() => {
  // 这里可以替换成自己的模板,格式为 [{"act": "", "prompt": ""}]
  const templateURL =
    "https://raw.githubusercontent.com/doggeddog/chatgpt-prompt-helper/master/templates/favorite.json";

  const button = document.createElement("div");
  button.classList.add("chatgpt-prompt-helper-button");
  button.textContent = "📋";
  document.body.appendChild(button);

  const list = document.createElement("div");
  list.classList.add("chatgpt-prompt-helper-list");
  list.style.display = "none";
  document.body.appendChild(list);

  const segmentFilter = document.createElement("div");
  segmentFilter.classList.add("chatgpt-prompt-helper-segment-filter");
  const segmentData = [
    "favorite",
    "language",
    "code",
    "write",
    "article",
    "ai",
    "comments",
    "text",
    "seo",
    "life",
    "interesting",
    "living",
    "speech",
    "mind",
    "social",
    "philosophy",
    "teacher",
    "interpreter",
    "games",
    "tool",
    "company",
    "doctor",
    "finance",
    "music",
    "professional",
    "contribute",
    "personal",
  ];
  for (let i = 0; i < segmentData.length; i++) {
    const segmentItem = document.createElement("div");
    segmentItem.classList.add("chatgpt-prompt-helper-segment-filter-item");
    segmentItem.textContent = segmentData[i];
    segmentFilter.appendChild(segmentItem);
    segmentItem.addEventListener("click", () => {
      loadTemplates(
        `https://raw.githubusercontent.com/doggeddog/chatgpt-prompt-helper/master/templates/${segmentData[i]}.json`
      );
      const segmentItems = document.getElementsByClassName(
        "chatgpt-prompt-helper-segment-filter-item"
      );
      for (const item of segmentItems) {
        item.classList.remove(
          "chatgpt-prompt-helper-segment-filter-item-active"
        );
      }
      segmentItem.classList.add(
        "chatgpt-prompt-helper-segment-filter-item-active"
      );
    });
    if (i == 0) {
      segmentItem.classList.add(
        "chatgpt-prompt-helper-segment-filter-item-active"
      );
    }
  }

  list.appendChild(segmentFilter);

  /**
   *  Event Listeners
   */

  let listVisible = false;
  let isDragging = false;
  let isMoving = false;
  let dragStartX;
  let dragStartY;
  let buttonStartX;
  let buttonStartY;

  const createListItem = (title, subtitle, content) => {
    const listItem = document.createElement("div");
    listItem.classList.add("chatgpt-prompt-helper-list-item");

    const itemTitle = document.createElement("div");
    itemTitle.classList.add("chatgpt-prompt-helper-list-item-title");
    itemTitle.textContent = title;
    listItem.appendChild(itemTitle);

    if (subtitle) {
      const itemSubtitle = document.createElement("div");
      itemSubtitle.classList.add("chatgpt-prompt-helper-list-item-subtitle");
      itemSubtitle.textContent = subtitle;
      itemSubtitle.addEventListener("click", () => {
        toggleElement(itemContent);
      });
      listItem.appendChild(itemSubtitle);
    }

    const itemContent = document.createElement("div");
    itemContent.classList.add("chatgpt-prompt-helper-list-item-content");
    itemContent.style.display = "none";
    itemContent.textContent = content;
    listItem.appendChild(itemContent);

    itemTitle.addEventListener("click", () => {
      toggleElement(itemContent);
    });

    itemContent.addEventListener("click", () => {
      const copyiedTag =
        '<div class="chatgpt-prompt-helper-copyied">已复制</div>';
      itemTitle.innerHTML = `${title} ${copyiedTag}`;
      setTimeout(() => {
        itemTitle.textContent = title;
      }, 2000);

      const textareas = document.querySelectorAll("textarea");
      let maxWidth = 0;
      let widestTextarea = null;
      textareas.forEach(function (textarea) {
        const width = textarea.offsetWidth;
        if (width > maxWidth) {
          maxWidth = width;
          widestTextarea = textarea;
        }
      });
      if (widestTextarea) {
        const event = new Event("input", { bubbles: true });
        widestTextarea.dispatchEvent(event);
        widestTextarea.value = content;
      }
      navigator.clipboard.writeText(content);
    });

    return listItem;
  };

  function toggleElement(element) {
    element.style.display = element.style.display === "none" ? "block" : "none";
  }

  function updateListPosition() {
    list.style.top = `${button.offsetTop - list.offsetHeight}px`;
    list.style.left = `${
      button.offsetLeft + button.offsetWidth / 2 - list.offsetWidth
    }px`;
  }

  button.addEventListener("click", () => {
    if (isMoving) {
      return;
    }
    listVisible = !listVisible;
    toggleElement(list);
    updateListPosition();
  });

  button.addEventListener("mousedown", (event) => {
    isDragging = true;
    isMoving = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    buttonStartX = button.offsetLeft;
    buttonStartY = button.offsetTop;
    updateListPosition();
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const offsetX = event.clientX - dragStartX;
      const offsetY = event.clientY - dragStartY;
      const newButtonX = buttonStartX + offsetX;
      const newButtonY = buttonStartY + offsetY;
      button.style.left = `${newButtonX}px`;
      button.style.top = `${newButtonY}px`;
      isMoving = offsetX > 5 || offsetY > 5;
      updateListPosition();
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });


  /**
   *  Fetch
   */

  async function fetchWithCache(url, cacheKey, cacheTime) {
    cacheKey = cacheKey || url;
    if (window.localStorage) {
      let cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheKey + "_expires");
      if (cachedTime && Date.now() > cachedTime) {
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheKey + "_expires");
        cachedData = null;
      }
      if (cachedData) {
        return Promise.resolve(JSON.parse(cachedData));
      }
    }

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (window.localStorage) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          if (cacheTime) {
            localStorage.setItem(cacheKey + "_expires", Date.now() + cacheTime);
          }
        }
        return data;
      });
  }

  function loadTemplates(url) {
    fetchWithCache(url, null, 60 * 60 * 24).then((data) => {
      // list remove all children except segment filter
      while (list.children.length > 1) {
        list.removeChild(list.lastChild);
      }
      data.forEach((item) => {
        const listItem = createListItem(item.act, item.sub, item.prompt);
        list.appendChild(listItem);
      });
    });
  }

  loadTemplates(templateURL);

  /**
   *  Style
   */
  const style = `
    .chatgpt-prompt-helper-button {
        position: fixed;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        bottom: 80px;
        right: 80px;
        transform: translateY(-50%);
        cursor: move;
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .chatgpt-prompt-helper-segment-filter {
        width: 100%;
        height: 40px;
        overflow-x: scroll;
        background-color: #fff;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        z-index: 9999;
    }

    .chatgpt-prompt-helper-segment-filter::-webkit-scrollbar {
      display: none;
    }

    .chatgpt-prompt-helper-segment-filter-item {
        padding: 5px 10px;
        cursor: pointer;
        background-color: #FFF3F3;
        color: #444;
        border-radius: 15px;
        margin: 0 5px;
        font-family: Arial, Helvetica, sans-serif;
    }

    .chatgpt-prompt-helper-segment-filter-item-active {
        background-color: #FFB6B6;
    }

    .chatgpt-prompt-helper-list {
        position: fixed;
        width: 300px;
        height: 400px;
        overflow-y: scroll;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        display: none;
        border-radius: 10px;
        padding: 10px;
    }

    .chatgpt-prompt-helper-list::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 6px;
        border: none;
    }

    .chatgpt-prompt-helper-list::-webkit-scrollbar {
        width: 6px;
    }

    .chatgpt-prompt-helper-list-item {
        border-bottom: 1px solid #eee;
        font-family: Arial, Helvetica, sans-serif;
        padding: 10px 0 10px 0;
    }

    .chatgpt-prompt-helper-list-item-title {
        cursor: pointer;
        font-size: 16px;
        color: #222;
        display: inline-flex;
        align-items: center;
    }

    .chatgpt-prompt-helper-list-item-subtitle {
      cursor: pointer;
      font-size: 10px;
      color: #666;
    }

    .chatgpt-prompt-helper-list-item-content {
        padding-top: 5px;
        cursor: pointer;
        font-size: 14px;
        color: #666;
    }

    .chatgpt-prompt-helper-copyied {
      text-align: center;
      line-height: 16px;
      color: #000;
      font-size: 10px;
      border-radius: 10px;
      background-color: rgba(0, 0, 255, 0.2);
      padding: 0 10px 0 10px;
      margin-left: 5px;
    }
  `;

  if (typeof GM_addStyle != "undefined") {
    GM_addStyle(style);
  } else if (typeof PRO_addStyle != "undefined") {
    PRO_addStyle(style);
  } else if (typeof addStyle != "undefined") {
    addStyle(style);
  } else {
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(style));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      document.documentElement.appendChild(node);
    }
  }

})();
