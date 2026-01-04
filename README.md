# CoFounder.ai

**CoFounder.ai** is a world-class project conceptualization engine designed for founders, engineers, and product managers. It transforms vague ideas into high-fidelity architectural blueprints, strategic market analyses, and step-by-step implementation roadmaps using the Google Gemini 3 Flash API.

## 🔗 Live Access
**View the live application here:** [CoFounder.ai](https://your-project-link.com)

---

## 🚀 Key Features

- **Strategic Blueprinting**: Generates a complete "Notebook" for any project, including title, domain analysis, and technical summaries.
- **Interactive Workflow Canvas**: A dual-map system visualizing *How it Works* (System Architecture) and *How to Build it* (Implementation Steps).
  - **Dynamic Tools**: Pan, zoom, draw, and place sticky notes to refine the AI-generated architecture.
  - **AI Refinement**: Add sticky notes with feedback and click "Apply" to let the AI rewrite the architecture based on your comments.
- **Build Sequence Generator**: Engineered prompt plans designed for AI Coding Assistants (like Cursor, Windsurf, or GitHub Copilot). Get copy-pasteable, sequential prompts to build your MVP.
- **Resources & Scope Analysis**: 
  - **Tech Stack**: Specific tool recommendations with reasoning.
  - **MVP Guardrails**: Defined "Must-Have", "Nice-to-Have", and "Out-of-Scope" features.
  - **Curated Links**: Functional, relevant links to GitHub repos, research papers (arXiv), and documentation.
- **Strategy & Market Visualization**: Dynamic data visualizations (Radar, Bar, Pie charts) showing market trends, segments, and projected revenue.
- **Voice-First Interaction**: Integrated speech-to-text for hands-free brainstorming and clarification answering.
- **Quick Export Engine**: Instant PDF generation focusing on a high-readability "Resources & Scope" report.
- **Privacy & Persistence**: All data stays in your browser's LocalStorage. Import/Export JSON backups for manual data management.

## 🛠 Tech Stack

- **Frontend**: React (ES6 Modules), Tailwind CSS
- **AI Engine**: Google Gemini 3 Flash (`@google/genai`)
- **Icons**: Lucide React
- **Visuals**: Custom SVG rendering for workflows and CSS-based dynamic charts.

## 💻 Local Setup

### Prerequisites
- Node.js installed.
- A Google Gemini API Key (get one at [ai.google.dev](https://ai.google.dev/)).

### Installation
1. Clone the repository or download the source files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment variable for your API Key:
   - On Linux/Mac: `export API_KEY=your_key_here`
   - On Windows (PowerShell): `$env:API_KEY="your_key_here"`
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 How to Use

1. **Describe Your Idea**: Enter a project description in the hero input. Use the microphone icon if you prefer to speak.
2. **Clarify (If Needed)**: If your idea is vague, the "Senior Project Architect" agent will ask 3-4 specific clarifying questions to narrow the scope.
3. **Explore the Notebook**:
   - **Workflow View**: Navigate the technical and system maps. Use the toolbar to add notes or drawings.
   - **Resources View**: Review the tech stack and MVP features.
   - **Strategy View**: Check the market risks and data projections.
4. **Generate Prompts**: Open the "Build Prompts" manager to get your sequential coding instructions.
5. **Export & Build**: Click "Quick Export" to get a printable PDF and start building with your favorite coding assistant.

## 🧠 Capabilities & Agents

CoFounder.ai uses specialized system instructions to emulate different roles:
- **Senior Project Architect**: Analyzes initial prompts for vagueness and ensures all technical bases are covered.
- **Strategic Project Consultant**: Researches market trends, revenue projections, and competitive landscapes.
- **Expert System Architect**: Refines complex graph structures and technical stack choices based on iterative user feedback.

---
*Created with focus on aesthetics and deep functionality for the next generation of builders.*
