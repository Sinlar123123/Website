"use client";

type AvatarAppearance = {
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

const SKIN = "#f0c7a5";
const SKIN_SHADE = "#dca482";

const HAIR_COLORS: Record<string, string> = {
  short: "#2a180f",
  long: "#6f3514",
  curly: "#b28626",
  punk: "#b31717",
};

const EYE_COLORS: Record<string, string> = {
  brown: "#5c3518",
  blue: "#2f67c7",
  green: "#2f7b41",
  gray: "#65748a",
};

const TOP_COLORS: Record<string, string> = {
  shirt_blue: "#4670d8",
  hoodie_black: "#2a2c33",
  dress_red: "#bc2d27",
};

const BOTTOM_COLORS: Record<string, string> = {
  pants_dark: "#1b2144",
  pants_light: "#8f9cae",
  skirt_violet: "#6f2bb5",
};

const BOOT_COLORS: Record<string, string> = {
  boots_black: "#141414",
  boots_brown: "#5a311f",
  sneakers_white: "#e8eaef",
};

function Hair({ style }: { style: string }) {
  const color = HAIR_COLORS[style] ?? HAIR_COLORS.short;

  if (style === "long") {
    return (
      <g>
        <path d="M50 72 C50 34 130 34 130 72 Q90 88 50 72 Z" fill={color} />
        <path d="M50 74 C45 104 40 145 42 185 C47 185 52 183 56 179 C54 146 55 108 60 80 Z" fill={color} />
        <path d="M130 74 C135 104 140 145 138 185 C133 185 128 183 124 179 C126 146 125 108 120 80 Z" fill={color} />
      </g>
    );
  }

  if (style === "curly") {
    return (
      <g>
        <circle cx="90" cy="50" r="30" fill={color} />
        <circle cx="62" cy="68" r="18" fill={color} />
        <circle cx="118" cy="68" r="18" fill={color} />
        <circle cx="54" cy="94" r="12" fill={color} />
        <circle cx="126" cy="94" r="12" fill={color} />
      </g>
    );
  }

  if (style === "punk") {
    return (
      <g>
        <path d="M55 76 C55 66 125 66 125 76 L125 84 L55 84 Z" fill={color} />
        <polygon points="72,78 78,32 84,78" fill={color} />
        <polygon points="88,76 94,20 100,76" fill={color} />
        <polygon points="104,78 110,32 116,78" fill={color} />
      </g>
    );
  }

  return <path d="M52 76 C50 36 130 36 128 76 Q90 92 52 76 Z" fill={color} />;
}

function Face({ appearance }: { appearance: AvatarAppearance }) {
  const eyeColor = EYE_COLORS[appearance.eyes] ?? EYE_COLORS.brown;
  const isFemale = appearance.body_type === "female";

  return (
    <g>
      <ellipse cx="76" cy="92" rx="9" ry="7" fill="white" />
      <ellipse cx="104" cy="92" rx="9" ry="7" fill="white" />
      <circle cx="76" cy="93" r="4.7" fill={eyeColor} />
      <circle cx="104" cy="93" r="4.7" fill={eyeColor} />
      <circle cx="76" cy="93" r="2.4" fill="#111" />
      <circle cx="104" cy="93" r="2.4" fill="#111" />
      {isFemale && (
        <>
          <path d="M66 84 Q76 77 86 84" stroke="#2f1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M94 84 Q104 77 114 84" stroke="#2f1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="68" cy="116" rx="7" ry="4.5" fill="#ef8b98" opacity="0.25" />
          <ellipse cx="112" cy="116" rx="7" ry="4.5" fill="#ef8b98" opacity="0.25" />
        </>
      )}

      {appearance.nose === "sharp" && <path d="M90 104 L84 118 L96 118 Z" fill={SKIN_SHADE} />}
      {appearance.nose === "round" && <ellipse cx="90" cy="114" rx="7" ry="5" fill={SKIN_SHADE} />}
      {appearance.nose === "classic" && (
        <path d="M84 104 Q90 116 96 104" stroke={SKIN_SHADE} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {appearance.mouth === "serious" && (
        <line x1="80" y1="132" x2="100" y2="132" stroke="#9f5a5a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {appearance.mouth === "wide" && <path d="M78 129 Q90 147 102 129" fill="#b94a4a" />}
      {appearance.mouth === "smile" && (
        <path d="M80 130 Q90 142 100 130" stroke="#b94a4a" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function Body({ appearance }: { appearance: AvatarAppearance }) {
  const topColor = TOP_COLORS[appearance.top] ?? TOP_COLORS.shirt_blue;
  const bottomColor = BOTTOM_COLORS[appearance.bottom] ?? BOTTOM_COLORS.pants_dark;
  const bootsColor = BOOT_COLORS[appearance.boots] ?? BOOT_COLORS.boots_black;
  const isDress = appearance.top === "dress_red";
  const isSkirt = appearance.bottom === "skirt_violet";
  const isFemale = appearance.body_type === "female";

  const torsoPath = isFemale
    ? "M64 164 C68 148 77 139 90 139 C103 139 112 148 116 164 L120 225 C117 246 106 260 90 260 C74 260 63 246 60 225 Z"
    : "M58 166 C62 150 74 142 90 142 C106 142 118 150 122 166 L126 230 C122 246 110 254 90 254 C70 254 58 246 54 230 Z";

  return (
    <g>
      <path d={isFemale ? "M73 144 L107 144 L103 168 L77 168 Z" : "M70 144 L110 144 L105 170 L75 170 Z"} fill={SKIN} />
      <path d={torsoPath} fill={topColor} />

      {isFemale ? (
        <>
          <path d="M64 168 C54 182 48 200 46 226 L58 230 C60 204 66 186 73 174 Z" fill={topColor} />
          <path d="M116 168 C126 182 132 200 134 226 L122 230 C120 204 114 186 107 174 Z" fill={topColor} />
          <circle cx="53" cy="232" r="8.5" fill={SKIN} />
          <circle cx="127" cy="232" r="8.5" fill={SKIN} />
        </>
      ) : (
        <>
          <path d="M58 168 C48 184 42 205 40 232 L52 236 C54 205 60 186 68 172 Z" fill={topColor} />
          <path d="M122 168 C132 184 138 205 140 232 L128 236 C126 205 120 186 112 172 Z" fill={topColor} />
          <circle cx="46" cy="238" r="9" fill={SKIN} />
          <circle cx="134" cy="238" r="9" fill={SKIN} />
        </>
      )}

      {!isDress && (
        <>
          {isFemale ? (
            <>
              <path d="M72 258 L83 258 L82 330 L69 330 Z" fill={bottomColor} />
              <path d="M98 258 L109 258 L112 330 L99 330 Z" fill={bottomColor} />
            </>
          ) : (
            <>
              <path d="M68 252 L84 252 L82 330 L64 330 Z" fill={bottomColor} />
              <path d="M96 252 L112 252 L116 330 L98 330 Z" fill={bottomColor} />
            </>
          )}
        </>
      )}

      {isSkirt && !isDress && (
        <path
          d={isFemale ? "M62 252 L118 252 L126 304 L54 304 Z" : "M56 252 L124 252 L132 302 L48 302 Z"}
          fill={bottomColor}
          opacity="0.92"
        />
      )}
      {isDress && (
        <path
          d={isFemale ? "M60 240 L120 240 L132 332 L48 332 Z" : "M54 244 L126 244 L138 330 L42 330 Z"}
          fill={TOP_COLORS.dress_red}
          opacity="0.95"
        />
      )}

      {isFemale ? (
        <>
          <path d="M60 330 L84 330 L86 344 L58 344 Z" fill={bootsColor} />
          <path d="M96 330 L120 330 L124 344 L96 344 Z" fill={bootsColor} />
        </>
      ) : (
        <>
          <path d="M58 330 L88 330 L90 344 L56 344 Z" fill={bootsColor} />
          <path d="M92 330 L122 330 L126 344 L92 344 Z" fill={bootsColor} />
        </>
      )}
    </g>
  );
}

const SLUGS_WITH_CUSTOM_SVG = new Set([
  "hat_straw",
  "hat_iron",
  "glasses_round",
  "beard_wizard",
  "sword_bronze",
  "umbrella_red",
]);

const FALLBACK_SLOT_POS: Record<string, { x: number; y: number }> = {
  hat: { x: 90, y: 20 },
  glasses: { x: 90, y: 82 },
  beard: { x: 90, y: 138 },
  weapon: { x: 148, y: 198 },
  accessory: { x: 26, y: 172 },
  cloak: { x: 90, y: 205 },
  mask: { x: 90, y: 86 },
  ring: { x: 132, y: 258 },
  gloves: { x: 42, y: 208 },
  belt: { x: 90, y: 232 },
  charm: { x: 118, y: 158 },
  shoulder: { x: 44, y: 138 },
  socks: { x: 90, y: 312 },
  earring: { x: 54, y: 72 },
  pet: { x: 34, y: 258 },
  aura: { x: 90, y: 44 },
  wings: { x: 22, y: 118 },
};

function GenericEquippedFlair({
  slots,
  itemIcons,
}: {
  slots: Record<string, string>;
  itemIcons?: Record<string, string>;
}) {
  return (
    <>
      {Object.entries(slots).map(([slot, slug]) => {
        if (SLUGS_WITH_CUSTOM_SVG.has(slug)) return null;
        const icon = itemIcons?.[slug] ?? "\u2728";
        const p = FALLBACK_SLOT_POS[slot] ?? { x: 150, y: 52 };
        return (
          <text
            key={`${slot}-${slug}`}
            x={p.x}
            y={p.y}
            fontSize={18}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {icon}
          </text>
        );
      })}
    </>
  );
}

function Accessories({
  slots,
  itemIcons,
}: {
  slots: Record<string, string>;
  itemIcons?: Record<string, string>;
}) {
  return (
    <g>
      {slots.hat === "hat_straw" && (
        <>
          <ellipse cx="90" cy="68" rx="56" ry="10" fill="#caa03d" />
          <rect x="64" y="38" width="52" height="30" rx="8" fill="#d5ad4d" />
        </>
      )}
      {slots.hat === "hat_iron" && (
        <>
          <ellipse cx="90" cy="68" rx="54" ry="10" fill="#8394a3" />
          <rect x="62" y="36" width="56" height="32" rx="8" fill="#9cb0bf" />
        </>
      )}
      {slots.glasses === "glasses_round" && (
        <>
          <circle cx="76" cy="92" r="11" fill="none" stroke="#1d1d1d" strokeWidth="2.6" />
          <circle cx="104" cy="92" r="11" fill="none" stroke="#1d1d1d" strokeWidth="2.6" />
          <line x1="87" y1="92" x2="93" y2="92" stroke="#1d1d1d" strokeWidth="2" />
        </>
      )}
      {slots.beard === "beard_wizard" && <path d="M74 136 Q78 170 90 194 Q102 170 106 136 Q90 146 74 136 Z" fill="#ece5d6" />}
      {slots.weapon === "sword_bronze" && (
        <g transform="translate(142,184) rotate(22)">
          <rect x="-3" y="-78" width="6" height="86" rx="2" fill="#d9a33b" />
          <rect x="-12" y="6" width="24" height="6" rx="2" fill="#7f5521" />
        </g>
      )}
      {slots.accessory === "umbrella_red" && (
        <g transform="translate(30,166)">
          <path d="M0 32 Q-24 8 -38 8 Q-20 2 0 32" fill="#bf2a2a" />
          <path d="M0 32 Q24 8 38 8 Q20 2 0 32" fill="#d93a3a" />
          <line x1="0" y1="32" x2="0" y2="98" stroke="#5b3a1d" strokeWidth="3" />
        </g>
      )}
      <GenericEquippedFlair slots={slots} itemIcons={itemIcons} />
    </g>
  );
}

type Props = {
  appearance: AvatarAppearance;
  size?: number;
  itemIcons?: Record<string, string>;
};

export default function AvatarSVG({ appearance, size = 280, itemIcons }: Props) {
  const isFemale = appearance.body_type === "female";

  return (
    <svg viewBox="0 0 180 350" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="346" rx="50" ry="4" fill="black" opacity="0.12" />
      <Body appearance={appearance} />
      <ellipse cx="90" cy="98" rx={isFemale ? 36 : 40} ry={isFemale ? 43 : 46} fill={SKIN} />
      <ellipse cx="52" cy="104" rx="8" ry="11" fill={SKIN} />
      <ellipse cx="128" cy="104" rx="8" ry="11" fill={SKIN} />
      <Hair style={appearance.hair} />
      {isFemale && <path d="M68 114 Q90 124 112 114" stroke="#f4a2af" strokeWidth="2.2" fill="none" opacity="0.7" />}
      <Face appearance={appearance} />
      <Accessories slots={appearance.equipped_slots} itemIcons={itemIcons} />
    </svg>
  );
}
