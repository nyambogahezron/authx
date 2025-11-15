import crypto from 'crypto';
import Webhook from '../models/Webhook.model';

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhooks(
  event: string,
  data: any
): Promise<void> {
  try {
    // Find all active webhooks for this event
    const webhooks = await Webhook.find({
      events: event,
      isActive: true,
    });

    if (webhooks.length === 0) {
      return;
    }

    // Send webhooks asynchronously
    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        const payload = {
          event,
          data,
          timestamp: new Date().toISOString(),
        };

        // Create signature
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          ...webhook.headers,
        };

        // Send webhook with retry logic
        let success = false;
        let attempts = 0;

        while (!success && attempts < webhook.retryAttempts) {
          try {
            const response = await fetch(webhook.url, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              success = true;
              webhook.lastTriggered = new Date();
              webhook.failureCount = 0;
              await webhook.save();
            } else {
              attempts++;
              if (attempts >= webhook.retryAttempts) {
                webhook.failureCount += 1;
                await webhook.save();

                // Disable webhook after 10 consecutive failures
                if (webhook.failureCount >= 10) {
                  webhook.isActive = false;
                  await webhook.save();
                }
              }
            }
          } catch (error) {
            attempts++;
            if (attempts >= webhook.retryAttempts) {
              webhook.failureCount += 1;
              await webhook.save();
            }
          }

          // Wait before retry (exponential backoff)
          if (!success && attempts < webhook.retryAttempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempts) * 1000)
            );
          }
        }
      } catch (error) {
        console.error(`Error triggering webhook ${webhook._id}:`, error);
      }
    });

    await Promise.allSettled(webhookPromises);
  } catch (error) {
    console.error('Error in triggerWebhooks:', error);
  }
}
