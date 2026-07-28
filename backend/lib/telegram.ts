export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN is not configured in environment variables.');
    return false;
  }
  if (!chatId) {
    console.warn('telegramChatId is missing for the recipient.');
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
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Telegram API error response:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network error attempting to send Telegram message:', error);
    return false;
  }
}
