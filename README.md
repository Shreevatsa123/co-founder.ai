# CoFounder.ai

**CoFounder.ai** is a professional-grade project conceptualization engine. It transforms vague ideas into high-fidelity architectural blueprints, strategic market analyses, and step-by-step implementation roadmaps using the Google Gemini 3 Flash API.

## 🔗 Live Access
**[Click here to view the live application](https://shreevatsa123.github.io/co-founder.ai/)**

---

## 🚀 What Can You Do With This App?

This tool acts as a "Technical Co-Founder" for solo developers and product managers.

### 1. **From Idea to Blueprint**
Simply type a vague idea (e.g., "A tinder for adopting dogs") or use the **Voice Input** microphone. The AI will:
*   Analyze the request for blind spots.
*   Ask clarifying questions (if needed).
*   Generate a complete project notebook.

### 2. **Interactive Workflow Maps**
The app generates two distinct visual maps:
*   **System Architecture:** How the data flows (Client -> API -> DB).
*   **Implementation Plan:** The step-by-step build order.
*   **Tools:** You can **Draw**, **Pan**, **Zoom**, and place **Sticky Notes** on the canvas.
*   **AI Refinement:** Place a sticky note with feedback (e.g., "Add Redis caching here") and click **Apply**. The AI will re-architect the entire system based on your notes.

### 3. **Generate "Build Prompts"**
Go to the **Build Plan** tab. The app generates a sequence of copy-pasteable prompts designed for AI coding assistants like **Cursor, Windsurf, or GitHub Copilot**.
*   *Step 1:* "Initialize Next.js project with these specific Tailwind settings..."
*   *Step 2:* "Set up the Supabase schema..."
*   *Step 3:* "Build the authentication hook..."

### 4. **Strategy & Resources**
*   **Visual Charts:** View projected revenue, market saturation, and risk heatmaps.
*   **Scope Guardrails:** See exactly what defines your MVP vs. V2 features.
*   **Tech Stack:** Get specific library recommendations (e.g., "Use Zustand for state, here is why...").

### 5. **Export**
Click the **Report** button to generate a clean, printable PDF of your entire project plan to share with stakeholders or keep for documentation.

---

## 🔒 Client-Side Security (Crucial)

Since this is a static website hosted on GitHub Pages, the API Key is technically exposed to the browser. To prevent unauthorized use, **you must configure Google Cloud Restrictions**.

If you are replicating this project, follow these steps to secure your API Key:

1.  Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2.  Click **Create Credentials** > **API Key**.
3.  **Website Restrictions (The Lock):**
    *   Under "Application restrictions", select **Websites**.
    *   Add your domain: `https://your-username.github.io/*`
    *   Add localhost for testing: `http://localhost:5173/*`
4.  **API Restrictions (The Key):**
    *   Under "API restrictions", select **Restrict key**.
    *   Select **Generative Language API** (Gemini).
5.  Save. Now, even if someone steals your key, they cannot use it outside of your specific website.

---

## 💻 How to Replicate (Local Development)

### Prerequisites
*   Node.js installed.
*   A Google Gemini API Key (get one at [ai.google.dev](https://ai.google.dev/)).

### 1. Clone & Install
```bash
git clone https://github.com/Shreevatsa123/co-founder.ai.git
cd co-founder.ai
npm install
```

### 2. Set API Key & Run
You need to inject the API key into the environment before running.

**Windows (PowerShell):**
```powershell
# Set the key for the current session
$env:GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"

# Start the dev server
npm run dev
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
npm run dev
```

*Note: The application uses `vite.config.ts` to map this environment variable to the frontend.*

---

## 🚀 How to Deploy to GitHub Pages

This project is configured to deploy using `gh-pages`.

1.  **Update Configuration:**
    Ensure `vite.config.ts` has the correct base path for your repository:
    ```typescript
    base: '/co-founder.ai/', // Change to match your repo name
    ```

2.  **Run Deployment:**
    This command builds the project and pushes the `dist` folder to a `gh-pages` branch.

    **Windows (PowerShell):**
    *If you run into script errors, you may need to bypass execution policy first:*
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
    $env:GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"; npm run deploy
    ```

    **Mac/Linux:**
    ```bash
    export GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE" && npm run deploy
    ```

3.  **Activate in GitHub:**
    Go to your Repository Settings > **Pages**. Ensure the source is set to `Deploy from branch` and select the `gh-pages` branch.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **AI Model**: Gemini 2.0 Flash / Gemini 1.5 Pro
- **Icons**: Lucide React
- **PDF Generation**: html2pdf.js

---
*Built with ❤️ by Shreevatsa.*
