export interface GeminiSceneObject {
  label: string;
  category: string;
  confidence: number;
  position: { region?: string };
  size?: string;
  notes?: string;
}

export interface GeminiSceneAnalysis {
  summary: string;
  objects: GeminiSceneObject[];
  issues: string[];
  optimizationSuggestions: string[];
}

export async function analyzeSceneWithGemini(params: {
  apiKey: string;
  imageBase64: string;
  model?: string;
}): Promise<GeminiSceneAnalysis> {
  const { apiKey, imageBase64, model = 'gemini-2.5-flash' } = params;

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `You are analyzing a 3D scene viewport from a web-based 3D editor. Analyze the rendered scene and return a JSON object with the following structure:
{
  "summary": "A brief description of the overall scene",
  "objects": [
    {
      "label": "object name/description",
      "category": "mesh|light|camera|group|environment",
      "confidence": 0.0 to 1.0,
      "position": { "region": "center|top-left|top-right|bottom-left|bottom-right|left|right|top|bottom" },
      "size": "small|medium|large",
      "notes": "any notable details"
    }
  ],
  "issues": ["list of potential scene issues like overlapping geometry, missing lights, etc."],
  "optimizationSuggestions": ["list of optimization suggestions for the scene"]
}

Only return valid JSON. Do not include markdown code fences or any other text.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed: GeminiSceneAnalysis = JSON.parse(text);
  return parsed;
}
