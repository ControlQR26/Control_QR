export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  const token = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.trim() : null;
  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not configured in environment variables.');
    return false;
  }
  if (!chatId) {
    console.warn('[Telegram] telegramChatId is missing for the recipient.');
    return false;
  }

  // Clean chatId to remove accidental whitespace or non-numeric symbols
  const cleanChatId = chatId.toString().trim();
  if (!cleanChatId) {
    console.warn('[Telegram] telegramChatId is empty after cleaning.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`[Telegram] API error response for chat ${cleanChatId}:`, errorData);

      // Fallback: Retry as plain text if HTML entity parsing fails
      if (errorData && typeof errorData.description === 'string' && errorData.description.includes("can't parse entities")) {
        const plainText = message.replace(/<[^>]*>?/gm, '');
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text: plainText,
          }),
        });
        if (retryRes.ok) {
          return true;
        }
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Telegram] Network/Fetch error attempting to send to ${cleanChatId}:`, error);
    return false;
  }
}
