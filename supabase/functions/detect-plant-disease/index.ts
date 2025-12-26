import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert agricultural scientist and plant pathologist specializing in plant disease detection for Tamil Nadu farmers. Your role is to analyze plant leaf images and provide accurate disease diagnosis.

CRITICAL INSTRUCTIONS:
1. Analyze the leaf image carefully for any signs of disease, pest damage, nutrient deficiency, or abnormalities
2. If the leaf is completely healthy with no issues, respond with is_healthy: true
3. If you detect ANY disease or problem, identify it specifically
4. ALWAYS provide 100% confidence in your diagnosis - never show uncertainty
5. Be consistent - the same image must always produce the same result

RESPONSE FORMAT (JSON only, no markdown):
{
  "is_healthy": boolean,
  "disease_name_en": "Disease name in English" or null if healthy,
  "disease_name_ta": "நோயின் பெயர் தமிழில்" or null if healthy,
  "plant_type": "Detected plant type",
  "cause_en": "Simple explanation of why this disease occurred, environmental or nutrient causes - keep it farmer-friendly and easy to understand",
  "cause_ta": "நோய் ஏற்படக் காரணம் - எளிமையாக விளக்கவும்",
  "remedy_organic_en": "Natural/organic remedy using household or farm items",
  "remedy_organic_ta": "இயற்கை தீர்வு - வீட்டில் கிடைக்கும் பொருட்களைக் கொண்டு",
  "remedy_chemical_en": "Chemical/pesticide treatment with dosage",
  "remedy_chemical_ta": "இரசாயன சிகிச்சை - அளவுடன்",
  "remedy_traditional_en": "Traditional/ancestral farming remedy passed down by elders",
  "remedy_traditional_ta": "பாரம்பரிய வழிமுறை - முன்னோர் கடைப்பிடித்த முறை"
}

For HEALTHY leaves, use this format:
{
  "is_healthy": true,
  "disease_name_en": null,
  "disease_name_ta": null,
  "plant_type": "Detected plant type",
  "cause_en": null,
  "cause_ta": null,
  "remedy_organic_en": null,
  "remedy_organic_ta": null,
  "remedy_chemical_en": null,
  "remedy_chemical_ta": null,
  "remedy_traditional_en": null,
  "remedy_traditional_ta": null
}

Remember: Tamil explanations must be simple enough for uneducated farmers to understand. Use everyday language, not technical terms.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, imageUrl } = await req.json();
    
    if (!imageBase64 && !imageUrl) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing plant disease detection request...');

    // Prepare the image content
    let imageContent: { type: string; image_url: { url: string } };
    if (imageBase64) {
      imageContent = {
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      };
    } else {
      imageContent = {
        type: "image_url",
        image_url: { url: imageUrl }
      };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this plant leaf image and detect any diseases. Provide your response in the exact JSON format specified. Be very detailed in Tamil explanations for farmers.'
              },
              imageContent
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'சேவை பரபரப்பாக உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.',
          error_en: 'Service is busy. Please try again in a moment.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'சேவை வரம்பு முடிந்தது.',
          error_en: 'Service limit reached.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('Raw AI response:', content);

    // Parse the JSON response
    let result;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      result = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse disease detection result');
    }

    console.log('Parsed result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-plant-disease function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      error_ta: 'தொழில்நுட்ப சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});