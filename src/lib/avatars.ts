// Child avatars — friendly animals/objects, never photos (U.3). No articles of faith on animals (D.4).
export const avatars = [
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "peacock", emoji: "🦚", label: "Peacock" },
  { id: "elephant", emoji: "🐘", label: "Elephant" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly" },
  { id: "turtle", emoji: "🐢", label: "Turtle" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "kite", emoji: "🪁", label: "Kite" },
] as const;
export const avatarEmoji = (id: string) => avatars.find((a) => a.id === id)?.emoji ?? "🦁";

export const ageBands = [
  { value: "4-5", label: "4–5" },
  { value: "6-7", label: "6–7" },
  { value: "8-9", label: "8–9" },
  { value: "10-12", label: "10–12" },
] as const;

export const levels = [
  { value: "new", label: "Just starting", hint: "Doesn't know Gurmukhi letters yet" },
  { value: "some", label: "Knows some letters", hint: "Recognises a few letters" },
  { value: "reading", label: "Can read a little", hint: "Reads simple words" },
] as const;
