/**
 * Utility function to send Telegram messages via the Telegram Bot API.
 * Uses the TELEGRAM_BOT_TOKEN environment variable.
 */
export async function sendTelegramMessage(chatId: string | number, message: string): Promise<boolean> {
  // Disable TLS rejection for local proxy/firewall edge cases
  if (typeof process !== 'undefined' && process.env) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  
  const token = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.trim() : null;
  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not configured in environment variables.');
    return false;
  }

  if (!chatId) {
    console.warn('[Telegram] telegramChatId is missing for the recipient.');
    return false;
  }

  // Clean chatId to remove accidental whitespace or invalid symbols
  const cleanChatId = String(chatId).trim();
  if (!cleanChatId) {
    console.warn('[Telegram] telegramChatId is empty after cleaning.');
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    console.log(`[Telegram] Sending message to Chat ID: ${cleanChatId}...`);
    
    // First attempt: HTML mode
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

    const responseData = await res.json().catch(() => null);

    if (res.ok && responseData?.ok) {
      console.log(`[Telegram] ✅ Message sent successfully to Chat ID: ${cleanChatId} (msg_id: ${responseData.result?.message_id})`);
      return true;
    }

    // If HTML failed (e.g. entities parse error, or formatting issue), retry as clean plain text
    const plainText = message.replace(/<[^>]*>?/gm, '').trim();
    console.warn(`[Telegram] HTML send failed for ${cleanChatId} (${responseData?.description || res.statusText}). Retrying in plain text...`);

    const retryRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: plainText,
      }),
    });

    const retryData = await retryRes.json().catch(() => null);

    if (retryRes.ok && retryData?.ok) {
      console.log(`[Telegram] ✅ Plain-text message sent successfully to Chat ID: ${cleanChatId}`);
      return true;
    }

    console.error(`[Telegram] ❌ API error response for Chat ID ${cleanChatId}:`, retryData || responseData || { status: retryRes.status });
    return false;
  } catch (error: any) {
    console.error(`[Telegram] ❌ Network/Fetch error attempting to send to ${cleanChatId}:`, error?.message || error);
    return false;
  }
}

