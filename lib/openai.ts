import { supabase } from './supabase';

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

export async function generatePlaybookInsights(data: PlaybookData) {
  try {
    const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playbook-insights`;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated session');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate insights');
    }

    const insights = await response.json();
    return {
      priorities: insights.priorities || [],
      tips: insights.tips || []
    };
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return {
      priorities: [
        "🎯 Focus on quality over quantity this week",
        "💬 Improve communication with your top matches",
        "🌟 Plan something special with your MVP"
      ],
      tips: [
        "🎭 Be authentic and show your true personality",
        "⏰ Don't wait too long between dates",
        "📝 Keep track of important details and preferences"
      ]
    };
  }
}