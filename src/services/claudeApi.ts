import Anthropic from '@anthropic-ai/sdk';
import type {
  PredictionContext,
  AIPrediction,
  Message,
  Participant,
} from '../types/conversation';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn('VITE_ANTHROPIC_API_KEY not found. AI predictions will not work.');
}

const client = API_KEY ? new Anthropic({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
}) : null;

interface PredictionRequest {
  context: PredictionContext;
  maxPredictions?: number;
  includeCategories?: boolean;
}

interface PredictionResponse {
  predictions: AIPrediction[];
  processingTime: number;
}

/**
 * Generate thought completions based on current input and conversation context
 */
export async function generateThoughtCompletions(
  request: PredictionRequest
): Promise<PredictionResponse> {
  const startTime = Date.now();

  if (!client) {
    return {
      predictions: [],
      processingTime: Date.now() - startTime,
    };
  }

  try {
    const prompt = buildPredictionPrompt(request.context, request.maxPredictions || 6);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const predictions = parsePredictions(responseText);

    return {
      predictions,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error generating predictions:', error);
    return {
      predictions: [],
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Build prompt for Claude based on conversation context
 */
function buildPredictionPrompt(context: PredictionContext, maxPredictions: number): string {
  const { conversationHistory, currentInput, activeParticipants, timeContext, userFatigueLevel } = context;

  // Build conversation history string
  const historyText = conversationHistory
    .slice(-10) // Last 10 messages for context
    .map(msg => {
      const participant = activeParticipants.find(p => p.id === msg.speakerId);
      return `${participant?.name || 'Unknown'}: ${msg.content}`;
    })
    .join('\n');

  const fatigueContext = userFatigueLevel === 'tired'
    ? 'The user is tired, so prioritize simple, common words.'
    : '';

  return `You are an AI assistant helping a person with ALS communicate using eye-tracking technology. The user types slowly (one dwell per character takes ~1 second), so your job is to predict the NEXT WORD(S) they want to type.

CONTEXT:
- Time of day: ${timeContext}
- User fatigue level: ${userFatigueLevel}
${fatigueContext}

RECENT CONVERSATION:
${historyText || '(No previous messages)'}

CURRENT INPUT: "${currentInput}"

Please provide ${maxPredictions} predictions for the NEXT WORD(S) the user is likely to type. Consider:
1. The conversation context and what makes sense to say next
2. Common needs for someone with ALS (medical needs, comfort, communication)
3. Natural sentence structure and grammar
4. The time of day and context

IMPORTANT:
- Predict NEXT words to continue the sentence, not complete new sentences
- Include both single words and common 2-3 word phrases
- Order by likelihood (most likely first)
- Keep words/phrases short and common

Format your response as a JSON array:
[
  {
    "content": "word or phrase",
    "confidence": 0.85,
    "category": "continuation|response|need|social"
  }
]

Return ONLY the JSON array, no other text.`;
}

/**
 * Parse Claude's response into predictions
 */
function parsePredictions(responseText: string): AIPrediction[] {
  try {
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return parsed.map((item: any, index: number) => ({
      id: `ai-pred-${Date.now()}-${index}`,
      content: item.content || '',
      confidence: item.confidence || 0.5,
      category: item.category,
      source: 'ai' as const,
    }));
  } catch (error) {
    console.error('Error parsing predictions:', error);
    return [];
  }
}

/**
 * Generate category-based predictions (for smart categories feature)
 */
export async function generateCategoryPredictions(
  context: PredictionContext,
  categories: string[]
): Promise<Record<string, AIPrediction[]>> {
  if (!client) {
    return {};
  }

  try {
    const prompt = buildCategoryPrompt(context, categories);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseCategoryPredictions(responseText, categories);
  } catch (error) {
    console.error('Error generating category predictions:', error);
    return {};
  }
}

/**
 * Build prompt for category-based predictions
 */
function buildCategoryPrompt(context: PredictionContext, categories: string[]): string {
  const { conversationHistory, activeParticipants, timeContext, userFatigueLevel } = context;

  const historyText = conversationHistory
    .slice(-10)
    .map(msg => {
      const participant = activeParticipants.find(p => p.id === msg.speakerId);
      return `${participant?.name || 'Unknown'}: ${msg.content}`;
    })
    .join('\n');

  return `You are helping a person with ALS communicate quickly using predictive text. Generate 15 complete sentence predictions for each of these categories: ${categories.join(', ')}.

CONTEXT:
- Time: ${timeContext}
- Present: ${activeParticipants.map(p => p.name).join(', ')}
- Fatigue: ${userFatigueLevel}

RECENT CONVERSATION:
${historyText || '(No conversation yet)'}

For each category, provide 15 complete, natural sentences the user is likely to want to say right now in this context.

Format as JSON:
{
  "category1": [
    { "content": "sentence", "confidence": 0.8, "category": "category1" },
    ...
  ],
  "category2": [...]
}

Categories should be: ${categories.join(', ')}

Return ONLY the JSON object.`;
}

/**
 * Parse category predictions from Claude response
 */
function parseCategoryPredictions(
  responseText: string,
  categories: string[]
): Record<string, AIPrediction[]> {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    const parsed = JSON.parse(jsonMatch[0]);
    const result: Record<string, AIPrediction[]> = {};

    for (const category of categories) {
      const items = parsed[category] || [];
      result[category] = items.map((item: any, index: number) => ({
        id: `cat-${category}-${Date.now()}-${index}`,
        content: item.content || '',
        confidence: item.confidence || 0.5,
        category: item.category || category,
        source: 'ai' as const,
      }));
    }

    return result;
  } catch (error) {
    console.error('Error parsing category predictions:', error);
    return {};
  }
}

/**
 * Stream predictions in real-time (for parallel thought streams feature - Phase 5)
 */
export async function* streamPredictions(
  context: PredictionContext
): AsyncGenerator<AIPrediction[], void, unknown> {
  if (!client) {
    return;
  }

  try {
    const prompt = buildPredictionPrompt(context, 4);

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    let accumulatedText = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        accumulatedText += chunk.delta.text;

        // Try to parse predictions from accumulated text
        const predictions = parsePredictions(accumulatedText);
        if (predictions.length > 0) {
          yield predictions;
        }
      }
    }
  } catch (error) {
    console.error('Error streaming predictions:', error);
  }
}

/**
 * Get a summary of a conversation session (for session summaries)
 */
export async function summarizeConversation(messages: Message[], participants: Participant[]): Promise<string> {
  if (!client || messages.length === 0) {
    return '';
  }

  try {
    const conversationText = messages.map(msg => {
      const participant = participants.find(p => p.id === msg.speakerId);
      return `${participant?.name || 'Unknown'}: ${msg.content}`;
    }).join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Summarize this conversation in 2-3 sentences:\n\n${conversationText}`,
      }],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return '';
  }
}
