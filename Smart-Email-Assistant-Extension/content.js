console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button";
  button.style.marginRight = "8px";
  button.style.backgroundColor = "#1a73e8"; // Blue color for the button
  button.style.color = "#ffffff"; // White text
  button.style.borderRadius = "20px"; // Rounded corners
  button.style.display = "flex"; // Flexbox for alignment
  button.style.alignItems = "center"; // Center content vertically
  button.style.padding = "8px 16px"; // Padding for the button
  button.style.cursor = "pointer"; // Pointer cursor for interactivity
  button.style.border = "none"; // Remove default border
  button.style.fontSize = "14px"; // Text size

  // Add the text label
  const label = document.createElement("span");
  label.textContent = "AI Reply";
  label.style.flexGrow = "1"; // Push the label to occupy full space
  button.appendChild(label);

  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  return button;
}

function getEmailContent() {
  const selectors = [".h7", ".a3s.ail", ".gmail_quote", '[role="toolbar"]'];

  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return ""; // Return an empty string if no content is found
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];

  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null; // Return null if no toolbar is found
}

function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();

  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, creating AI button");
  const button = createAIButton(); // Proper invocation of createAIButton()

  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;

      const emailContent = getEmailContent();
      if (!emailContent) {
        throw new Error("Email content is empty or could not be retrieved.");
      }

      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      });

      if (!response.ok) {
        throw new Error("API Request Failed with status " + response.status);
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );

      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.error("Compose box was not found");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate reply: " + error.message);
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(".aDh, .btC, [role='dialog']") ||
          node.querySelector(".aDh, .btC, [role='dialog']"))
    );

    if (hasComposeElements) {
      console.log("Compose Window Detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
