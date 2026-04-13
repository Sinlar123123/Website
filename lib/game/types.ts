export type AvatarAppearance = {
  body_type: "male" | "female";
  hair: string;
  eyes: string;
  nose: string;
  mouth: string;
  top: string;
  bottom: string;
  boots: string;
  equipped_slots: Record<string, string>;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  character_setup_complete: boolean;
  coins: number;
  xp: number;
  level: number;
};

export type GameItem = {
  slug: string;
  name: string;
  slot: string;
  price: number;
  icon: string;
  rarity: string;
};
