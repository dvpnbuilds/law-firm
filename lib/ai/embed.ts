import { openrouterEmbed } from "./openrouter";
import { EMBEDDING_MODEL } from "./models";

export async function embedText(text: string): Promise<number[]> {
  return openrouterEmbed(text, EMBEDDING_MODEL);
}
