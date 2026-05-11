// ---------------------------------------------------------------------------
// use-gemini.ts — Streaming Gemini chat hook
// ---------------------------------------------------------------------------

import { useCredentials } from './use-credentials';
import { useTasksStore } from '../store/tasks.store';
import { useAgendaStore } from '../store/agenda.store';
import { useChatStore } from '../store/chat.store';
import { GeminiService } from '../services/gemini.service';
import type { GeminiMessage } from '../services/gemini.service';
import { buildSystemPrompt, parseIntentFromResponse, stripIntentBlock } from '../services/intent-parser.service';
import { getUserFacingError } from '../utils/error.utils';
import type { AIIntent, ChatMessage } from '../types/ai-intent.types';

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

function msgToGemini(msg: ChatMessage): GeminiMessage {
  return {
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  };
}

export function useGemini() {
  const { credentials } = useCredentials();
  const tasksStore = useTasksStore();
  const agendaStore = useAgendaStore();
  const chatStore = useChatStore();

  const send = async (text: string): Promise<AIIntent | null | undefined> => {
    if (!credentials.geminiApiKey) return undefined;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text,
      time: new Date().toISOString(),
    };
    chatStore.addMessage(userMsg);
    chatStore.setStreaming(true);

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      text: '',
      time: new Date().toISOString(),
      streaming: true,
    };
    chatStore.addMessage(assistantMsg);

    let fullText = '';

    try {
      const pendingTasks = tasksStore.tasks.filter((t) => t.status !== 'done');
      const systemPrompt = buildSystemPrompt({
        todayEvents: agendaStore.events,
        pendingTasks,
      });

      // Build history excluding the current streaming assistant placeholder
      const history = chatStore.messages
        .filter((m) => !m.streaming)
        .map(msgToGemini);

      const generator = GeminiService.chatStream(
        credentials.geminiApiKey,
        credentials.geminiModel ?? 'gemini-2.0-flash',
        history,
        systemPrompt,
      );

      for await (const token of generator) {
        fullText += token;
        chatStore.updateLastMessage({ text: fullText });
      }
    } catch (e) {
      fullText = getUserFacingError(e);
    }

    const intent = parseIntentFromResponse(fullText);
    const displayText = stripIntentBlock(fullText);

    chatStore.updateLastMessage({
      text: displayText,
      streaming: false,
      intent: intent ?? undefined,
      hasActions: intent != null,
    });
    chatStore.setStreaming(false);

    return intent;
  };

  return {
    send,
    isStreaming: chatStore.isStreaming,
    messages: chatStore.messages,
    selectedModel: chatStore.selectedModel,
    setModel: chatStore.setModel,
    clearHistory: chatStore.clearHistory,
  };
}
