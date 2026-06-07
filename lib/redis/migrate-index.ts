import { getRedis } from "./client";

const LESSON_INDEX_VERSION_KEY = "meta:lesson_index_version";
const LESSON_INDEX_VERSION = "2";

export async function ensureLessonIndexVersion(): Promise<void> {
  const redis = await getRedis();
  const current = await redis.get(LESSON_INDEX_VERSION_KEY);

  if (current === LESSON_INDEX_VERSION) {
    return;
  }

  try {
    await redis.ft.dropIndex("idx:lessons");
  } catch {
    // Index may not exist yet
  }

  await redis.set(LESSON_INDEX_VERSION_KEY, LESSON_INDEX_VERSION);
}
