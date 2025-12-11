
import { GoogleGenAI, Type } from "@google/genai";
import { Blueprint, ChatMessage, ClarificationResponse, AppWorkflow, StickyNote, TechItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

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
      systemInstruction: `You are a Strategic Project Consultant.
      Create a comprehensive project planner "Notebook".
      
      CRITICAL OUTPUTS:
      1. 'appWorkflow': A diagram of how the system WORKS (User actions -> System -> Data).
      2. 'implementationWorkflow': A diagram of how to BUILD the system (Step-by-step dev guide: Setup -> Frontend -> Backend -> Deploy).
      3. 'techStack': Specific, modern recommendations.
      4. 'strategicInsights': Generate 3-4 domain-specific data visualizations that are CRITICAL for this specific project type. 
         - For Fintech: Fraud Heatmap, Transaction Volume by Hour.
         - For Social: User Retention Curve, Virality Coefficient.
         - For E-commerce: Cart Abandonment Rate, Conversion Funnel.
         - For ML/AI: Model Accuracy vs Data Size, Feature Importance.
         Replace generic revenue charts with these specific insights.

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
                 type: { type: Type.STRING, enum: ['bar', 'pie', 'line', 'stat'] },
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
            description: "System Architecture Diagram (How it works)",
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action'] },
                    details: { type: Type.STRING }
                  }
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } }
                }
              }
            },
            required: ["nodes", "edges"]
          },

          implementationWorkflow: {
            type: Type.OBJECT,
            description: "Step-by-step Development Guide (How to build it)",
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action'] },
                    details: { type: Type.STRING }
                  }
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, label: { type: Type.STRING } }
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
                description: { type: Type.STRING }
              },
              required: ["title", "type", "description"]
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
     1. Update the 'systemWorkflow' to reflect functionality changes.
     2. Update the 'implementationWorkflow' to reflect build step changes if necessary.
     3. Update the 'techStack' if the feedback implies new tools.
     
     Ensure graph connectivity. Output JSON only.
   `;

   const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: `You are an expert system architect. 
      Refine the project plan based on user feedback.
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
                   properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action'] }, details: { type: Type.STRING } },
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
                    properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING, enum: ['user', 'system', 'data', 'action'] }, details: { type: Type.STRING } },
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

    The user is asking a question. Act as a helpful Co-founder.
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
