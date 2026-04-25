import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Get signal direction color
function getEmbedColor(direction) {
  const colors = {
    'BUY': 0x00C851,   // Green
    'SELL': 0xFF4444,  // Red
    'HOLD': 0xFFD700,  // Yellow
    'WATCH': 0xF59E0B, // Gold
  };
  return colors[direction] || 0x888888;
}

// Determine asset type and get webhook URLs
function getWebhookUrls(assetType) {
  const trekWebhook = Deno.env.get('DISCORD_WEBHOOK_TREK');
  const eliteWebhook = Deno.env.get('DISCORD_WEBHOOK_ELITE');
  
  const channelWebhooks = {
    'STOCK': Deno.env.get('DISCORD_WEBHOOK_STOCKS'),
    'CRYPTO': Deno.env.get('DISCORD_WEBHOOK_CRYPTO'),
    'FOREX': Deno.env.get('DISCORD_WEBHOOK_FOREX'),
  };

  const urls = [trekWebhook]; // Always post to #trek-signals
  const typeUrl = channelWebhooks[assetType?.toUpperCase()] || channelWebhooks['STOCK'];
  
  if (typeUrl && typeUrl !== trekWebhook) {
    urls.push(typeUrl);
  }

  return { urls, eliteWebhook };
}

// Post to Discord webhook
async function postToDiscord(webhookUrl, embed) {
  if (!webhookUrl) return;
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    
    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Discord webhook error:', error.message);
  }
}

// Build embed
function buildEmbed(payload, isElite = false) {
  const {
    symbol,
    action,
    confidence,
    reason,
    bullishReasoning,
    bearishReasoning,
    userName,
    userTier,
    isAutoTrek = false,
  } = payload;

  const color = getEmbedColor(action);
  const title = isElite ? `⭐ HIGH CONFIDENCE SIGNAL — ${action} ${symbol}` : `⚡ TREK SIGNAL — ${action} ${symbol}`;
  
  const fields = [];

  if (reason) {
    fields.push({
      name: '📊 Thesis',
      value: reason,
      inline: false,
    });
  }

  if (bullishReasoning) {
    fields.push({
      name: '🟢 Opportunity',
      value: bullishReasoning,
      inline: false,
    });
  }

  if (bearishReasoning) {
    fields.push({
      name: '🔴 Risk',
      value: bearishReasoning,
      inline: false,
    });
  }

  fields.push({
    name: 'Confidence',
    value: `${confidence}%`,
    inline: true,
  });

  // Footer attribution
  let footerText;
  if (isAutoTrek) {
    footerText = 'TREK AI · TREDIO';
  } else {
    footerText = `Shared by ${userName} · ${userTier || 'Free'} Member`;
  }

  return {
    title,
    description: `**${action}** ${symbol}\n\nOpen in TREDIO: https://tredio.app`,
    color,
    fields,
    footer: {
      text: footerText,
    },
    timestamp: new Date().toISOString(),
  };
}

// Main handler
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      symbol,
      action,
      confidence = 0,
      reason = '',
      bullishReasoning = '',
      bearishReasoning = '',
      assetType = 'STOCK',
      isAutoTrek = false,
    } = body;

    if (!symbol || !action) {
      return Response.json({ error: 'Missing symbol or action' }, { status: 400 });
    }

    const { urls, eliteWebhook } = getWebhookUrls(assetType);
    const userName = user.full_name || user.email?.split('@')[0] || 'User';
    const userTier = user.tier || 'Free';

    const embed = buildEmbed({
      symbol,
      action,
      confidence,
      reason,
      bullishReasoning,
      bearishReasoning,
      userName,
      userTier,
      isAutoTrek,
    });

    // Post to primary channels
    for (const url of urls) {
      await postToDiscord(url, embed);
    }

    // Post to elite picks if 85%+ confidence
    if (confidence >= 85 && eliteWebhook) {
      const eliteEmbed = buildEmbed({
        symbol,
        action,
        confidence,
        reason,
        bullishReasoning,
        bearishReasoning,
        userName,
        userTier,
        isAutoTrek,
      }, true);
      await postToDiscord(eliteWebhook, eliteEmbed);
    }

    return Response.json({
      success: true,
      posted_to: urls.length,
      elite_posted: confidence >= 85 && eliteWebhook ? true : false,
    });
  } catch (error) {
    console.error('discordWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});