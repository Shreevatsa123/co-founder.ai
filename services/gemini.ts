
import { GoogleGenAI, Type } from "@google/genai";
import { Blueprint, ChatMessage, ClarificationResponse, AppWorkflow, StickyNote, TechItem, PromptStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-3-flash-preview"; 

/**
 * Step 1: Analyze the prompt to see if we need to ask clarifying questions.
 */
export const analyzeRequest = async (prompt: string): Promise<ClarificationResponse> => {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: `You are a Senior Project Architect.
      Analyze the user's project idea.
      If the idea is vague (e.g., "I want a food app"), return 'isClarificationNeeded': true and provide 3-4 specific questions to narrow the scope (Target audience? Platform? Unique value?).
      If the idea is already very detailed, set 'isClarificationNeeded': false and return empty questions.
      
      Output JSON only.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: { type: Type.ARRAY, items: { type: Type.STRING } },
          isClarificationNeeded: { type: Type.BOOLEAN }
        },
        required: ["questions", "isClarificationNeeded"]
      }
    }
  });

  if (!response.text) throw new Error("No analysis generated");
  return JSON.parse(response.text) as ClarificationResponse;
};

/**
 * Step 2: Generate the full blueprint.
 */
export const generateBlueprint = async (originalPrompt: string, qaPairs: {question: string, answer: string}[] = []): Promise<Blueprint> => {
  
  let combinedPrompt = `User's Initial Idea: "${originalPrompt}"\n\n`;
  
  if (qaPairs.length > 0) {
    combinedPrompt += "Additional Context from Q&A:\n";
    qaPairs.forEach((qa, i) => {
      combinedPrompt += `Q${i+1}: ${qa.question}\nA: ${qa.answer}\n`;
    });
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: combinedPrompt,
    config: {
      thinkingConfig: { thinkingBudget: 16384 }, 
      systemInstruction: `You are a Principal Systems Architect.
      The user requires an EXTREMELY GRANULAR, ATOMIC-LEVEL technical blueprint.
      
      CRITICAL INSTRUCTION: EXPLODE COMPLEXITY.
      - Never represent a process as a single node. Break it down.
      - "Login" is NOT one node. It is: "UI Input" -> "Client Validation" -> "POST /login" -> "Rate Limit Check" -> "DB Lookup" -> "Password Hash Compare" -> "Generate JWT" -> "Return Session".
      - "Payment" is NOT one node. It is: "Cart Validation" -> "Tax Calc" -> "Lock Inventory" -> "Stripe Intent" -> "User Confirm" -> "Webhook Listener" -> "Update Ledger" -> "Email Receipt".
      - aim for 40-60 nodes in the System Architecture to make it look impressive and dense.

      REQUIREMENTS:

      1. **'appWorkflow' (System Architecture)**:
         - **Topology**: Dense, interconnected graph. Use 'decision' nodes for every logical branch (e.g., "Is Verified?", "Has Stock?", "Auth Valid?").
         - **Details Field**: Strictly technical. 2-4 lines explaining the component's specific function. No conversational filler ("This node does..."). Just the facts.
         - **Nodes**: Mix of 'user' (interactions), 'system' (services), 'data' (stores/schemas), 'action' (functions), 'decision' (logic gates).

      2. **'implementationWorkflow' (Build Roadmap)**:
         - **Granularity**: Break the build into specific engineering tasks.
         - **MANDATORY FIELDS**:
           - **label**: The Engineering Task (e.g., "Implement Redis Cache Layer").
           - **details**: Concise summary of the task.
           - **technicalDescription**: Specific implementation details (e.g., "Use ioredis with a write-through strategy for user sessions...").
           - **whyNeeded**: Architectural justification.
           - **userBenefit**: End-user impact.
           - **executionSteps**: 3-5 atomic sub-steps (e.g., "1. npm install ioredis", "2. Create RedisClient singleton", "3. Add connection error listeners").
           - **searchQueries**: Specific search terms for developers.

      3. **'recommendedResources'**: 
         - 6 high-quality, specific resources (Documentation, Whitepapers, GitHub Repos).

      Output JSON adhering to the schema.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          domain: { type: Type.STRING },
          
          marketAnalysis: {
            type: Type.OBJECT,
            properties: {
              targetAudience: { type: Type.STRING },
              keyCompetitors: { type: Type.ARRAY, items: { type: Type.STRING } },
              currentTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
              totalAddressableMarket: { type: Type.STRING },
              projectedRevenue: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { year: { type: Type.STRING }, amount: { type: Type.NUMBER }, unit: { type: Type.STRING } }
                }
              },
              marketSegments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { segment: { type: Type.STRING }, percentage: { type: Type.NUMBER } }
                }
              }
            },
            required: ["targetAudience", "keyCompetitors", "currentTrends", "totalAddressableMarket", "projectedRevenue", "marketSegments"]
          },
          
          strategicInsights: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 title: { type: Type.STRING },
                 type: { type: Type.STRING, enum: ['bar', 'pie', 'line', 'stat', 'radar'] },
                 data: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } }
                   }
                 },
                 summary: { type: Type.STRING }
               },
               required: ["title", "type", "data", "summary"]
             }
          },

          userSentiment: {
            type: Type.OBJECT,
            properties: {
              commonComplaints: { type: Type.ARRAY, items: { type: Type.STRING } },
              praisePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              userExpectations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["commonComplaints", "praisePoints", "userExpectations"]
          },

          scope: {
            type: Type.OBJECT,
            properties: {
              coreFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              optionalFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              outOfScope: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["coreFeatures", "optionalFeatures", "outOfScope"]
          },

          coreConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
              },
              required: ["name", "description", "complexity"]
            }
          },
          techStack: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                reason: { type: Type.STRING }
              },
              required: ["category", "tools", "reason"]
            }
          },

          appWorkflow: {
            type: Type.OBJECT,
            description: "Complex System Architecture (Granular)",
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action', 'decision'] },
                    details: { type: Type.STRING }
                  },
                  required: ["id", "label", "type", "details"]
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } },
                  required: ["from", "to"]
                }
              }
            },
            required: ["nodes", "edges"]
          },

          implementationWorkflow: {
            type: Type.OBJECT,
            description: "Detailed Build Roadmap (Granular)",
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action', 'decision'] },
                    details: { type: Type.STRING },
                    technicalDescription: { type: Type.STRING },
                    whyNeeded: { type: Type.STRING },
                    userBenefit: { type: Type.STRING },
                    executionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    searchQueries: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "label", "type", "details", "technicalDescription", "whyNeeded", "userBenefit", "executionSteps", "searchQueries"]
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } },
                  required: ["from", "to"]
                }
              }
            },
            required: ["nodes", "edges"]
          },

          risksAndLiabilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recommendedResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["paper", "video", "article", "repo", "tool"] },
                description: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "type", "description", "url"]
            }
          }
        },
        required: [
          "title", "summary", "domain", "marketAnalysis", "strategicInsights", "userSentiment", "scope",
          "coreConcepts", "techStack", "appWorkflow", "implementationWorkflow", "risksAndLiabilities", "recommendedResources"
        ]
      }
    }
  });

  if (!response.text) {
    throw new Error("No content generated");
  }

  return JSON.parse(response.text) as Blueprint;
};

/**
 * Step 3: Unified Refinement (Updates both workflows and tech stack)
 */
export const refineProjectDetails = async (
  systemWorkflow: AppWorkflow,
  implementationWorkflow: AppWorkflow,
  techStack: TechItem[],
  stickyNotes: StickyNote[]
): Promise<{ systemWorkflow: AppWorkflow, implementationWorkflow: AppWorkflow, techStack: TechItem[] }> => {
   
   if (!stickyNotes || stickyNotes.length === 0) return { systemWorkflow, implementationWorkflow, techStack };

   const feedbackText = stickyNotes.map(n => `- ${n.content}`).join('\n');
   
   const prompt = `
     Current System Workflow (How it works): ${JSON.stringify(systemWorkflow)}
     Current Implementation Workflow (How to build it): ${JSON.stringify(implementationWorkflow)}
     Current Tech Stack: ${JSON.stringify(techStack)}

     USER FEEDBACK / REQUESTED CHANGES:
     ${feedbackText}

     Task: 
     1. Update the 'systemWorkflow' to reflect functionality changes. Be GRANULAR. Break new steps into atomic nodes.
     2. Update the 'implementationWorkflow' to reflect build step changes. Be DETAILED.
     3. Update the 'techStack' if the feedback implies new tools.
     
     Ensure graph connectivity. Output JSON only.
   `;

   const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
      systemInstruction: `You are an expert system architect. Refine the project plan based on user feedback.
      Maintain extreme granularity and technical depth. Do not summarize.
      Output JSON only matching the schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          systemWorkflow: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: { 
                     id: { type: Type.STRING }, 
                     label: { type: Type.STRING }, 
                     type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action', 'decision'] }, 
                     details: { type: Type.STRING } 
                   },
                   required: ["id", "label", "type", "details"]
                }
              },
              edges: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } }, required: ["from", "to"] }
              }
            },
            required: ["nodes", "edges"]
          },
          implementationWorkflow: {
             type: Type.OBJECT,
             properties: {
               nodes: {
                 type: Type.ARRAY,
                 items: {
                    type: Type.OBJECT,
                    properties: { 
                      id: { type: Type.STRING }, 
                      label: { type: Type.STRING }, 
                      type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action', 'decision'] }, 
                      details: { type: Type.STRING },
                      technicalDescription: { type: Type.STRING },
                      whyNeeded: { type: Type.STRING },
                      userBenefit: { type: Type.STRING },
                      executionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      searchQueries: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["id", "label", "type", "details", "technicalDescription", "whyNeeded", "userBenefit", "executionSteps", "searchQueries"]
                 }
               },
               edges: {
                 type: Type.ARRAY,
                 items: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } }, required: ["from", "to"] }
               }
             },
             required: ["nodes", "edges"]
           },
           techStack: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: { category: { type: Type.STRING }, tools: { type: Type.ARRAY, items: { type: Type.STRING } }, reason: { type: Type.STRING } },
               required: ["category", "tools", "reason"]
             }
           }
        },
        required: ["systemWorkflow", "implementationWorkflow", "techStack"]
      }
    }
   });

   if (!response.text) throw new Error("No refined details generated");
   return JSON.parse(response.text) as { systemWorkflow: AppWorkflow, implementationWorkflow: AppWorkflow, techStack: TechItem[] };
};

export const sendMessageToProject = async (
  currentBlueprint: Blueprint, 
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  
  const context = `
    Current Project: ${currentBlueprint.title}
    Domain: ${currentBlueprint.domain}
    Summary: ${currentBlueprint.summary}
    Tech Stack: ${currentBlueprint.techStack.map(t => t.tools.join(', ')).join('; ')}

    The user is a technical founder asking a question.
    Act as a Principal Engineer. Be technical, precise, and helpful.
  `;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: context
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text || "I'm not sure how to respond to that.";
};

/**
 * Step 4: Generate Build Prompts
 */
export const generateProjectPrompts = async (blueprint: Blueprint): Promise<PromptStep[]> => {
  const context = `
    Project: ${blueprint.title}
    Summary: ${blueprint.summary}
    Tech Stack: ${blueprint.techStack.map(t => t.tools.join(', ')).join('; ')}
    Core Features: ${blueprint.scope.coreFeatures.join(', ')}
    Implementation Plan: ${JSON.stringify(blueprint.implementationWorkflow)}
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: context,
    config: {
      systemInstruction: `You are a Senior DevOps & Lead Architect.
      Create a step-by-step "Prompt Plan" that the user can copy-paste into an AI coding assistant (like Cursor, Windsurf, or ChatGPT) to build this project from scratch.

      Guidelines:
      1. Break the build into 5-8 logical chunks (e.g., "Setup & Config", "Database Schema", "Auth System", "Core Feature A", "UI Polish").
      2. Each prompt must be self-contained but sequential.
      3. Prompts should include specific tech stack instructions based on the provided stack.
      4. The prompts should tell the AI assistant exactly what files to create and what logic to implement.

      Output JSON only.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.NUMBER },
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['pending', 'completed'] }
          },
          required: ["step", "title", "prompt", "status"]
        }
      }
    }
  });

  if (!response.text) throw new Error("No prompts generated");
  const rawSteps = JSON.parse(response.text) as Omit<PromptStep, 'id'>[];
  
  return rawSteps.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    status: 'pending' // Force initial status
  }));
};

/**
 * Step 5: Refine/Analyze Step Output
 */
export const refinePromptStep = async (step: PromptStep, userOutput: string): Promise<string> => {
  const prompt = `
    The user ran this prompt:
    "${step.prompt}"

    And got this result/output (could be code or error logs):
    "${userOutput}"

    Analyze if this looks correct. If there are errors, suggest a fix. If it looks good, confirm it and suggest what to check next.
    Keep it brief (under 100 words).
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful Senior Engineer reviewing code output."
    }
  });

  return response.text || "Analysis failed.";
};
