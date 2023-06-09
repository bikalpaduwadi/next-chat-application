const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = 'zrange' | 'sismember' | 'get' | 'smembers';

// Because the next caches the query responses and it sometimes gives unexpected results
// we are using this custom function to query redis values
export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  // `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailAddress}`
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`;
  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();

  return data.result;
}
