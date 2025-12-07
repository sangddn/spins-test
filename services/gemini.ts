import { GoogleGenAI, Modality, Type } from "@google/genai";

// Helper: Decode Base64 to Uint8Array
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Add WAV Header to raw PCM data
function addWavHeader(samples: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length, true);

  // Write the PCM samples
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(samples);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export interface SpinOutline {
  title: string;
  coverImagePrompt: string;
  tracks: { title: string; description: string }[];
}

export const generateSpinOutline = async (topic: string): Promise<SpinOutline> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert audio producer creating a structured "album" or "spin" based on the request: "${topic}".
      
      Tasks:
      1. Create a creative, catchy Title for this Spin (e.g., "The Quantum Leap", "Jazz Bots").
      2. Write a detailed text-to-image prompt for the main album cover art.
      3. Create an outline of 4-6 distinct tracks (segments) that tell a cohesive story.
      
      Structure:
      1. Intro/Hook
      2-4. Core segments
      5. Outro/Summary
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            coverImagePrompt: { type: Type.STRING },
            tracks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    let jsonText = response.text || '{}';
    // Cleanup markdown if present (safety check)
    if (jsonText.trim().startsWith('```')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    }

    const json = JSON.parse(jsonText);
    
    return {
      title: json.title || topic,
      coverImagePrompt: json.coverImagePrompt || `Abstract cover art for ${topic}`,
      tracks: json.tracks || []
    };

  } catch (error) {
    console.error("Error generating outline:", error);
    return { 
        title: topic, 
        coverImagePrompt: `Abstract art representing ${topic}`,
        tracks: [{ title: "Introduction", description: `Intro to ${topic}` }] 
    };
  }
};

export const generateTrackAudio = async (title: string, description: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // 1. Generate the Script
    const scriptModel = 'gemini-2.5-flash';
    const scriptPrompt = `
      You are a charismatic podcast host for the show "Spins".
      Write a script (approx 80-120 words) for a track titled "${title}".
      Context of the full spin: "${context}".
      Specific focus for this track: "${description}".
      
      Style: Conversational, engaging, no sound effects cues.
      If this is an intro, welcome the listener.
      If this is a middle track, segue smoothly.
    `;

    const scriptResponse = await ai.models.generateContent({
      model: scriptModel,
      contents: scriptPrompt,
    });
    
    const scriptText = scriptResponse.text || `Welcome to this track about ${title}.`;

    // 2. Convert Script to Audio
    const ttsModel = 'gemini-2.5-flash-preview-tts';
    const ttsResponse = await ai.models.generateContent({
      model: ttsModel,
      contents: [{ parts: [{ text: scriptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini.");
    }

    const rawPcm = decodeBase64(base64Audio);
    const wavBuffer = addWavHeader(rawPcm, 24000, 1);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Using Nano Banana Pro (gemini-3-pro-image-preview)
    const model = 'gemini-3-pro-image-preview'; 
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        return `data:image/png;base64,${base64String}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};