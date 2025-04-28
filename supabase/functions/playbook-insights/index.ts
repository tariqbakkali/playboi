// @ts-ignore: Unreachable code error
import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

interface PlaybookData {
  profiles: any[];
  meetings: any[];
  stats: {
    avgRating: number;
    totalDates: number;
    bestPlayer: { name: string; rating: number };
    biggestInvestment: { name: string; amount: number };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Check for OpenAI API key
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          message: 'OpenAI API key not configured',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Parse request data
    const data: PlaybookData = await req.json();
    
    // Validate input data
    if (!data?.profiles?.length || !data?.meetings?.length || !data?.stats) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Missing required data fields',
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Generate insights using OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a playful, encouraging dating coach who gives strategic advice with a fun tone.',
        },
        {
          role: 'user',
          content: `Analyze this dating data and provide personalized advice:
            - Recent activity: ${data.meetings.length} dates
            - Average rating: ${data.stats.avgRating}
            - Best performer: ${data.stats.bestPlayer.name}
            
            Provide:
            1. Three priority recommendations for this week
            2. Three coaching tips based on the data
            
            Keep each point concise and fun. Use emojis.`
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse AI response
    const content = completion.choices[0].message.content;
    const [prioritiesSection, tipsSection] = content.split('\n\n');
    
    const priorities = prioritiesSection
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    const tips = tipsSection
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    // Return formatted response
    return new Response(
      JSON.stringify({ priorities, tips }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate insights',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});