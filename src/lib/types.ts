export type PreviewRole = "listener" | "artist" | "dj" | "matatu" | "admin";
export type RoleAction = { label: string; supportingText: string; role: PreviewRole };
export type MusicItem = { title: string; artist: string; accent: "coral" | "plum" | "lime" | "lavender" };
export type Campaign = { title: string; artist: string; reward: string; status: "New" | "Trending" | "Active" };
