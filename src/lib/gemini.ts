const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Base System Instruction to enforce Nomichi's voice guidelines
const NOMICHI_VOICE_RULES = `
You write for Nomichi, a community-led travel brand focused on slow, offbeat, small-group journeys.
Adhere strictly to these voice guidelines:
1. Warm, honest, specific, still.
2. Written in the second person ("you", "we").
3. Use short, simple sentences.
4. ABSOLUTELY NO exclamation marks (except for genuine festival joy).
5. ABSOLUTELY NO em-dashes.
6. ABSOLUTELY NO AI-isms or marketing buzzwords such as "unlock", "elevate", "embark on a journey", "discover", "unleash", "adventure of a lifetime".
7. Prefer a concrete, tangible detail (e.g., "reading a book by the river", "sleeping under clear skies") over an abstract feeling.
8. The brand line is: "Travel that finds you." Use it contextually if appropriate.
`;

async function callGemini(systemInstruction: string, promptText: string): Promise<string> {
  const isConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key';

  if (!isConfigured) {
    return generateFallbackResponse(systemInstruction, promptText);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nInput Data:\n${promptText}` }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const json = await response.json();
    let text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any double quotes or formatting issues
    text = text.trim().replace(/^["']|["']$/g, '');
    return text;
  } catch (error) {
    console.error('Gemini API fetch error, falling back to local generator:', error);
    return generateFallbackResponse(systemInstruction, promptText);
  }
}

// ----------------------------------------------------
// LOCAL FALLBACK RESPONSE GENERATOR
// ----------------------------------------------------
function generateFallbackResponse(systemInstruction: string, promptText: string): string {
  // Parse prompt text to identify the subject
  const lowerPrompt = promptText.toLowerCase();
  
  if (systemInstruction.includes('whatsapp')) {
    // Determine details
    const nameMatch = promptText.match(/Name:\s*([^\n]+)/);
    const tripMatch = promptText.match(/Trip:\s*([^\n]+)/);
    const hopeMatch = promptText.match(/Hopes:\s*([^\n]+)/);
    
    const name = nameMatch ? nameMatch[1].trim().split(' ')[0] : 'there';
    const trip = tripMatch ? tripMatch[1].trim() : 'our upcoming journey';
    const hope = hopeMatch ? hopeMatch[1].trim() : '';

    let personalNote = 'I read your details.';
    if (hope) {
      if (hope.toLowerCase().includes('disconnect') || hope.toLowerCase().includes('startup')) {
        personalNote = 'I read that you want to disconnect from startup life. We spend lots of quiet hours by the river doing just that.';
      } else if (hope.toLowerCase().includes('culture') || hope.toLowerCase().includes('local')) {
        personalNote = 'I saw you want to experience the local culture. We will share meals with local families and walk through villages.';
      } else if (hope.toLowerCase().includes('friends') || hope.toLowerCase().includes('catch up')) {
        personalNote = 'I see you are traveling with high school friends to catch up. We keep the itinerary spacious so you have time for each other.';
      } else {
        // Truncate and clean up hope
        personalNote = `I saw your note about wanting to ${hope.toLowerCase().substring(0, 50).replace(/[.,]/g, '')}. That matches our pace.`;
      }
    }

    return `Hey ${name}, this is Siddharth from Nomichi. I saw your enquiry for the ${trip}. ${personalNote} Let me know if you would like to have a brief phone call this week.`;
  }

  if (systemInstruction.includes('vibe')) {
    const hopeMatch = promptText.match(/Hopes:\s*([^\n]+)/);
    const groupMatch = promptText.match(/Group:\s*([^\n]+)/);
    const hope = hopeMatch ? hopeMatch[1].trim() : '';
    const group = groupMatch ? groupMatch[1].trim() : 'solo';

    if (hope.toLowerCase().includes('disconnect') || hope.toLowerCase().includes('slow') || hope.toLowerCase().includes('quiet')) {
      return `Good fit. The traveller seeks quietude and disconnection, which is exactly what our slow itinerary and small group size provide.`;
    }
    if (hope.toLowerCase().includes('culture') || hope.toLowerCase().includes('local')) {
      return `Strong fit. They show interest in community-led travel, village meals, and slower paces over checklists.`;
    }
    if (group === 'friends' || group === 'family') {
      return `Potential fit. They are traveling as a ${group}. We need to make sure the whole group aligns with the silent hours and shared meals.`;
    }
    return `Potential fit. The traveller seeks a shift in pace, which aligns with Nomichi. Let's schedule a call to explore further.`;
  }

  if (systemInstruction.includes('summarise')) {
    // Parse notes
    if (lowerPrompt.includes('payment') || lowerPrompt.includes('confirmed')) {
      return 'Seat confirmed for the trip; we need to send the onboarding packet and coordinate arrival.';
    }
    if (lowerPrompt.includes('voicemail') || lowerPrompt.includes('left a message')) {
      return 'Left a voicemail for the traveller; next action is to follow up via text if they do not call back.';
    }
    if (lowerPrompt.includes('vibe check') || lowerPrompt.includes('spoke')) {
      return 'Spoke with traveller and confirmed they align with our slow travel pace; next step is invoice generation.';
    }
    return 'Lead is active and contact is in progress; follow up is needed to finalize dates.';
  }

  return 'Configuration set. Ready for follow up.';
}

// ----------------------------------------------------
// PUBLIC API METHODS
// ----------------------------------------------------

export async function readLeadVibe(lead: {
  name: string;
  group_type: string;
  what_they_hope_trip_feels_like: string;
  trip_name?: string;
}): Promise<string> {
  const systemInstruction = `
${NOMICHI_VOICE_RULES}
Task:
You are an expert community coordinator. Analyze the traveller's enquiry answers.
Suggest whether the traveller looks like a fit for slow, small-group travel.
Provide a clear, brief one-line reason (max 25 words).
Be encouraging but realistic. A suggestion only, never an automatic reject.
Format: Keep it to a single sentence.
`;

  const promptText = `
Name: ${lead.name}
Trip: ${lead.trip_name || 'General enquiry'}
Group Type: ${lead.group_type}
Hopes: ${lead.what_they_hope_trip_feels_like}
`;

  return callGemini(systemInstruction, promptText);
}

export async function draftWhatsAppMessage(lead: {
  name: string;
  what_they_hope_trip_feels_like: string;
  trip_name?: string;
  owner_name?: string;
}): Promise<string> {
  const systemInstruction = `
${NOMICHI_VOICE_RULES}
Task:
Draft the first WhatsApp message for this lead, using the trip details and what the traveller told you.
Keep it warm, short (under 45 words), and written in our voice.
Do not use exclamation marks or em-dashes.
Do not use standard AI phrases like "I hope this email finds you well" or "We are thrilled".
Greet them, mention their specific trip, connect with one specific detail they shared, and suggest a call.
Identify yourself as ${lead.owner_name || 'Siddharth'} from Nomichi.
`;

  const promptText = `
Name: ${lead.name}
Trip: ${lead.trip_name || 'our upcoming travels'}
Hopes: ${lead.what_they_hope_trip_feels_like}
`;

  return callGemini(systemInstruction, promptText);
}

export async function summarizeCallLogs(logs: { note: string; author_email: string }[]): Promise<string> {
  if (!logs || logs.length === 0) {
    return 'No call notes logged yet. Next action is first contact.';
  }

  const systemInstruction = `
${NOMICHI_VOICE_RULES}
Task:
Summarise the call log on this lead into a single one-line statement (max 20 words) detailing: "where this stands and what to do next".
Focus on the latest state of communication and the next action.
`;

  const promptText = logs.map((l, i) => `Note ${i + 1} (${l.author_email}): ${l.note}`).join('\n');

  return callGemini(systemInstruction, promptText);
}
