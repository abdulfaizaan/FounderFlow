import Pusher from "pusher";
import { env } from "@/lib/env";

let _pusher: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (!env.PUSHER_APP_ID || !env.PUSHER_KEY || !env.PUSHER_SECRET) return null;
  if (!_pusher) {
    _pusher = new Pusher({
      appId: env.PUSHER_APP_ID,
      key: env.PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: env.PUSHER_CLUSTER || "",
    });
  }
  return _pusher;
}
