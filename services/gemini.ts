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
      If the idea is very vague (1-3 words), return 'isClarificationNeeded': true with 3 specific questions.
      If it has enough detail to infer a structure, return 'isClarificationNeeded': false.
      Prioritize action over questions.
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
  
  let combinedPrompt = `User's Idea: "${originalPrompt}"\n`;
  
  if (qaPairs.length > 0) {
    combinedPrompt += "Context:\n";
    qaPairs.forEach((qa, i) => {
      combinedPrompt += `Q: ${qa.question} A: ${qa.answer}\n`;
    });
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: combinedPrompt,
    config: {
      systemInstruction: `You are a Principal Systems Architect. Generate a comprehensive, high-fidelity technical blueprint.

      CRITICAL INSTRUCTIONS FOR DEPTH & GRANULARITY:
      
      1. **'appWorkflow' (System Architecture)**: 
         - Generate **8 to 15 nodes**. DO NOT OVERSIMPLIFY.
         - Nodes must cover the full stack: Client (Web/Mobile), CDN, Load Balancers, API Gateway, Auth Service, Core Services, Database (Primary/Replica/Cache), External Integrations (Stripe/SendGrid/AI), and Async Workers.
         - Show the real complexity of a production app.

      2. **'implementationWorkflow' (Build Roadmap)**: 
         - Generate **8 to 15 detailed steps**.
         - Sequence: Environment -> DB Design -> Auth -> Core API -> Frontend Infrastructure -> Key Features -> Polish -> Deploy.
         - 'executionSteps': Provide specific technical commands or logic (e.g., "npx create-next-app", "Define Prisma schema for User").
         - 'technicalDescription': Name specific libraries (e.g., "Zustand for state", "Postgres for DB").

      3. **'strategicInsights'**: 
         - Generate exactly **3 charts**: 'growth_prediction', 'heatmap' (Risk), and 'pie' (Market).

      4. **General**:
         - Assume the user is a Senior Developer. Use precise terminology.
         - Focus on the "Happy Path" but acknowledge complexity.

      Output JSON only.
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
                 type: { type: Type.STRING, enum: ['bar', 'pie', 'line', 'stat', 'radar', 'growth_prediction', 'heatmap'] },
                 data: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: { 
                        label: { type: Type.STRING }, 
                        value: { type: Type.NUMBER },
                        projectedValue: { type: Type.NUMBER },
                        secondaryValue: { type: Type.NUMBER }
                      }
                   }
                 },
                 summary: { type: Type.STRING },
                 xAxisLabel: { type: Type.STRING },
                 yAxisLabel: { type: Type.STRING }
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
            description: "System Flow (Step-wise)",
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
            description: "Build Specs",
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
     Current System: ${JSON.stringify(systemWorkflow)}
     Current Build Plan: ${JSON.stringify(implementationWorkflow)}
     Stack: ${JSON.stringify(techStack)}

     CHANGES:
     ${feedbackText}

     Task: Refine the system & implementation plans based on feedback. Keep it detailed and handle complex requests.
     Output JSON only.
   `;

   const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: `You are an expert system architect. Refine the project plan.
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
    Project: ${currentBlueprint.title}
    Domain: ${currentBlueprint.domain}
    Summary: ${currentBlueprint.summary}
    Stack: ${currentBlueprint.techStack.map(t => t.tools.join(', ')).join('; ')}

    Role: Principal Engineer. Be concise but technical.
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
    Stack: ${blueprint.techStack.map(t => t.tools.join(', ')).join('; ')}
    Features: ${blueprint.scope.coreFeatures.join(', ')}
    Plan: ${JSON.stringify(blueprint.implementationWorkflow)}
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: context,
    config: {
      systemInstruction: `You are a Lead DevOps & AI Architect.
      Create a "Cursor/Windsurf Master Plan" for an AI coding assistant.
      Break the project into 8-12 atomic, testable prompt steps (Sequential).
      
      Structure:
      1. Setup & Config (Tailwind, TypeScript, ESLint, Project Structure)
      2. Core UI Layout (Shell, Navigation)
      3. Data Layer (Mock Data / Schema Interfaces)
      4. State Management
      5-10. Feature Implementation (Granular, one major component per step)
      11. Final Polish & Error Handling
      
      Each prompt must be self-contained and technically specific.
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
    Prompt: "${step.prompt}"
    Result: "${userOutput}"
    Analyze if correct. Suggest fix or next step. Brief.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful Senior Engineer."
    }
  });

  return response.text || "Analysis failed.";
};