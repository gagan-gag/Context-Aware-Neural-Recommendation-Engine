"""
Generate clean, studio-grade isolated garment SVG assets for AVERO catalog products.
Each SVG uses a #F5F5F3 clean studio background, realistic garment geometry,
seams, collars, buttons, and subtle fabric shading - isolated clothing only, no people.
"""
import os

OUTPUT_DIR = r"d:\INTERNSHIP's\ZAALIMA\Context-Aware Neural Recommendation Engine\frontend\avero-next\public\catalog"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SVGS = {
    # 0730713001: Tailored Blazer (Women, Outerwear, Black)
    "0730713001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="blazer-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242426"/>
      <stop offset="50%" stop-color="#1A1A1C"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
    <linearGradient id="blazer-lapel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2E2E32"/>
      <stop offset="100%" stop-color="#1F1F22"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Main Jacket Body -->
    <path d="M 230 150 L 150 200 L 120 440 L 170 450 L 190 320 L 195 620 C 195 635 210 645 230 645 L 370 645 C 390 645 405 635 405 620 L 410 320 L 430 450 L 480 440 L 450 200 L 370 150 C 340 165 260 165 230 150 Z" fill="url(#blazer-body)"/>
    <!-- Collar and Lapels -->
    <path d="M 240 155 L 205 320 L 265 370 L 298 420 L 300 640 L 302 420 L 335 370 L 395 320 L 360 155 C 330 170 270 170 240 155 Z" fill="url(#blazer-lapel)"/>
    <!-- Lapel Notch Left -->
    <polygon points="205,320 220,310 245,340 225,355" fill="#18181A"/>
    <!-- Lapel Notch Right -->
    <polygon points="395,320 380,310 355,340 375,355" fill="#18181A"/>
    <!-- Center Button -->
    <circle cx="300" cy="450" r="7" fill="#0D0D0E" stroke="#444448" stroke-width="1.5"/>
    <circle cx="300" cy="510" r="7" fill="#0D0D0E" stroke="#444448" stroke-width="1.5"/>
    <!-- Welt Pockets -->
    <rect x="215" y="520" width="70" height="8" rx="2" fill="#18181A" stroke="#2D2D30" stroke-width="1"/>
    <rect x="315" y="520" width="70" height="8" rx="2" fill="#18181A" stroke="#2D2D30" stroke-width="1"/>
    <!-- Breast Pocket -->
    <rect x="230" y="380" width="45" height="5" rx="1" fill="#18181A" stroke="#2D2D30" stroke-width="1"/>
  </g>
</svg>""",

    # 0751471001: Chiffon Maxi Dress (Women, Dresses, Red)
    "0751471001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#800000" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="dress-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5222E"/>
      <stop offset="45%" stop-color="#A81824"/>
      <stop offset="100%" stop-color="#84101A"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Flowing Chiffon Maxi Dress Silhouette -->
    <!-- Bodice & Straps -->
    <path d="M 260 140 C 265 170 255 240 250 280 C 275 295 325 295 350 280 C 345 240 335 170 340 140 L 320 140 C 315 180 305 200 300 200 C 295 200 285 180 280 140 Z" fill="#991520"/>
    <path d="M 250 280 C 275 295 325 295 350 280 L 355 330 C 330 340 270 340 245 330 Z" fill="#A81824"/>
    <!-- Cinched Waist Band -->
    <rect x="245" y="330" width="110" height="18" rx="4" fill="#801018" stroke="#B8202A" stroke-width="1"/>
    <!-- Flowing A-Line Maxi Skirt with graceful drape folds -->
    <path d="M 245 348 Q 230 500 150 710 Q 220 735 300 730 Q 380 735 450 710 Q 370 500 355 348 Z" fill="url(#dress-red)"/>
    <!-- Drape Highlights -->
    <path d="M 270 348 Q 250 520 220 720" stroke="#D93844" stroke-width="2.5" fill="none" opacity="0.6"/>
    <path d="M 300 348 Q 300 520 300 730" stroke="#D93844" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M 330 348 Q 350 520 380 720" stroke="#7A0C14" stroke-width="3" fill="none" opacity="0.7"/>
  </g>
</svg>""",

    # 0865857002: Satin Midi Dress (Women, Dresses, Burgundy)
    "0865857002.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#4A0E17" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="satin-burgundy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B1D2F"/>
      <stop offset="35%" stop-color="#85253B"/>
      <stop offset="65%" stop-color="#541424"/>
      <stop offset="100%" stop-color="#3D0B18"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Cowl neck slip dress -->
    <path d="M 255 160 L 260 210 Q 300 240 340 210 L 345 160 L 335 160 L 332 205 Q 300 225 268 205 L 265 160 Z" fill="#6B1D2F"/>
    <!-- Bodice -->
    <path d="M 260 210 Q 300 235 340 210 L 348 360 C 330 375 270 375 252 360 Z" fill="url(#satin-burgundy)"/>
    <!-- Midi Skirt with Bias Cut -->
    <path d="M 252 360 C 240 460 210 560 190 660 Q 300 680 410 660 C 390 560 360 460 348 360 Z" fill="url(#satin-burgundy)"/>
    <!-- Satin Sheen Shimmer Lines -->
    <path d="M 275 230 Q 285 450 260 665" stroke="#A83852" stroke-width="3" fill="none" opacity="0.5"/>
    <path d="M 315 230 Q 325 450 335 665" stroke="#380812" stroke-width="4" fill="none" opacity="0.6"/>
  </g>
</svg>""",

    # 0583845001: Rib-Knit Jumper (Women, Knitwear, Beige)
    "0583845001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#6B5B4D" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="knit-beige" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EBE5DB"/>
      <stop offset="50%" stop-color="#DDD5C7"/>
      <stop offset="100%" stop-color="#CEBFAC"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Rib knit sweater body & dropped sleeves -->
    <path d="M 240 180 C 260 190 340 190 360 180 L 450 250 L 510 470 L 460 485 L 415 330 L 410 600 C 410 610 395 620 380 620 L 220 620 C 205 620 190 610 190 600 L 185 330 L 140 485 L 90 470 L 150 250 Z" fill="url(#knit-beige)"/>
    <!-- Chunky Crewneck Ribbed Collar -->
    <path d="M 240 180 C 265 205 335 205 360 180 C 345 168 255 168 240 180 Z" fill="#C2B29D" stroke="#A89680" stroke-width="1.5"/>
    <!-- Hem & Cuff Ribbing -->
    <rect x="190" y="590" width="220" height="30" rx="3" fill="#C2B29D" opacity="0.6"/>
    <!-- Ribbed Vertical Texture Lines -->
    <path d="M 240 215 L 240 590 M 270 215 L 270 590 M 300 215 L 300 590 M 330 215 L 330 590 M 360 215 L 360 590" stroke="#BAAA95" stroke-width="1" opacity="0.5"/>
  </g>
</svg>""",

    # 0924243001: Wide-Leg Trousers (Women, Trousers, Grey)
    "0924243001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.10"/>
    </filter>
    <linearGradient id="trouser-grey" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#85858A"/>
      <stop offset="50%" stop-color="#6E6E73"/>
      <stop offset="100%" stop-color="#55555A"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- High-rise waistband -->
    <rect x="225" y="160" width="150" height="30" rx="4" fill="#5E5E63" stroke="#48484C" stroke-width="1"/>
    <!-- Wide-leg drape silhouette -->
    <path d="M 225 190 L 170 700 L 285 700 L 300 340 L 315 700 L 430 700 L 375 190 Z" fill="url(#trouser-grey)"/>
    <!-- Crisp Center Front Creases -->
    <line x1="227" y1="230" x2="227" y2="700" stroke="#A2A2A8" stroke-width="2" opacity="0.6"/>
    <line x1="373" y1="230" x2="373" y2="700" stroke="#A2A2A8" stroke-width="2" opacity="0.6"/>
    <!-- Slash pockets -->
    <line x1="230" y1="200" x2="255" y2="245" stroke="#48484C" stroke-width="2"/>
    <line x1="370" y1="200" x2="345" y2="245" stroke="#48484C" stroke-width="2"/>
  </g>
</svg>""",

    # 0614768001: Ribbed Knit Turtleneck (Women, Tops, Black)
    "0614768001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="turtleneck-black" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#262628"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Turtleneck Collar Roll -->
    <rect x="260" y="140" width="80" height="55" rx="6" fill="#1F1F22" stroke="#3A3A3E" stroke-width="1.5"/>
    <!-- Sleek Long-Sleeve Silhouette -->
    <path d="M 260 190 L 180 230 L 130 520 L 170 530 L 205 340 L 210 580 C 210 595 225 605 240 605 L 360 605 C 375 605 390 595 390 580 L 395 340 L 430 530 L 470 520 L 420 230 L 340 190 Z" fill="url(#turtleneck-black)"/>
    <!-- Fine ribbing lines -->
    <line x1="265" y1="145" x2="265" y2="190" stroke="#3A3A3E" stroke-width="1"/>
    <line x1="280" y1="145" x2="280" y2="190" stroke="#3A3A3E" stroke-width="1"/>
    <line x1="300" y1="145" x2="300" y2="190" stroke="#3A3A3E" stroke-width="1"/>
    <line x1="320" y1="145" x2="320" y2="190" stroke="#3A3A3E" stroke-width="1"/>
    <line x1="335" y1="145" x2="335" y2="190" stroke="#3A3A3E" stroke-width="1"/>
  </g>
</svg>""",

    # 0685687001: Regular Fit Oxford Shirt (Men, Tops, White)
    "0685687001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
    <linearGradient id="oxford-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FBFBF9"/>
      <stop offset="100%" stop-color="#F2F2EC"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Shirt Body & Long Sleeves -->
    <path d="M 235 170 L 150 220 L 115 500 L 165 510 L 195 320 L 195 620 Q 300 650 405 620 L 405 320 L 435 510 L 485 500 L 450 220 L 365 170 Z" fill="url(#oxford-white)" stroke="#E0E0D8" stroke-width="1.5"/>
    <!-- Button-down collar -->
    <polygon points="235,170 270,230 300,195 330,230 365,170 300,180" fill="#FFFFFF" stroke="#D5D5CC" stroke-width="1.5"/>
    <!-- Center Placket -->
    <rect x="290" y="195" width="20" height="435" fill="#FFFFFF" stroke="#E0E0D8" stroke-width="1"/>
    <!-- Buttons -->
    <circle cx="300" cy="245" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <circle cx="300" cy="305" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <circle cx="300" cy="365" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <circle cx="300" cy="425" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <circle cx="300" cy="485" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <circle cx="300" cy="545" r="4" fill="#FFFFFF" stroke="#B0B0A8" stroke-width="1.5"/>
    <!-- Left Chest Pocket -->
    <polygon points="230,310 275,310 275,360 252,375 230,360" fill="none" stroke="#D5D5CC" stroke-width="1.5"/>
  </g>
</svg>""",

    # 0918522002: Suede Bomber Jacket (Men, Outerwear, Brown)
    "0918522002.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#382010" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="suede-brown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9E6843"/>
      <stop offset="50%" stop-color="#845230"/>
      <stop offset="100%" stop-color="#6B3F21"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Bomber Jacket Silhouette -->
    <path d="M 235 175 L 140 220 L 105 480 L 155 490 L 185 320 L 185 580 C 185 595 200 605 220 605 L 380 605 C 400 605 415 595 415 580 L 415 320 L 445 490 L 495 480 L 460 220 L 365 175 Z" fill="url(#suede-brown)"/>
    <!-- Ribbed Baseball Collar -->
    <path d="M 235 175 C 265 195 335 195 365 175 C 340 160 260 160 235 175 Z" fill="#422413" stroke="#5E371C" stroke-width="1.5"/>
    <!-- Center Metal Zip -->
    <line x1="300" y1="185" x2="300" y2="605" stroke="#C0B296" stroke-width="4"/>
    <!-- Zip puller -->
    <rect x="296" y="240" width="8" height="18" rx="2" fill="#D6CBB4" stroke="#8A7A60" stroke-width="1"/>
    <!-- Ribbed Cuffs and Hem -->
    <rect x="185" y="580" width="230" height="25" rx="4" fill="#422413"/>
    <!-- Slanted welt pockets -->
    <line x1="220" y1="460" x2="265" y2="495" stroke="#422413" stroke-width="4"/>
    <line x1="380" y1="460" x2="335" y2="495" stroke="#422413" stroke-width="4"/>
  </g>
</svg>""",

    # 0110065001: Classic Crewneck Jersey Top (Men, Tops, White)
    "0110065001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
    <linearGradient id="jersey-white" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="80%" stop-color="#FAF9F5"/>
      <stop offset="100%" stop-color="#EDEDE4"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- T-Shirt Body & Short Sleeves -->
    <path d="M 230 170 L 130 220 L 105 320 L 165 340 L 190 280 L 190 620 C 190 635 205 645 225 645 L 375 645 C 395 645 410 635 410 620 L 410 280 L 435 340 L 495 320 L 470 220 L 370 170 Z" fill="url(#jersey-white)" stroke="#E0E0D8" stroke-width="1.5"/>
    <!-- Bound Crew Neck Collar -->
    <path d="M 230 170 C 260 205 340 205 370 170 C 345 158 255 158 230 170 Z" fill="#F4F3EE" stroke="#D5D5CC" stroke-width="2"/>
    <!-- Subtle Seam Lines -->
    <path d="M 190 280 L 230 170" stroke="#E5E5DE" stroke-width="1.5"/>
    <path d="M 410 280 L 370 170" stroke="#E5E5DE" stroke-width="1.5"/>
  </g>
</svg>""",

    # 0852521001: Double-Breasted Trench Coat (Collections, Outerwear, Beige)
    "0852521001.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#4A3B2C" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="trench-beige" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E2D4BF"/>
      <stop offset="50%" stop-color="#D4C3A9"/>
      <stop offset="100%" stop-color="#C2AF93"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Long Trench Coat Body -->
    <path d="M 230 150 L 140 200 L 110 500 L 160 515 L 185 340 L 160 710 L 440 710 L 415 340 L 440 515 L 490 500 L 460 200 L 370 150 Z" fill="url(#trench-beige)"/>
    <!-- Wide Lapels & Collar -->
    <polygon points="230,150 185,280 260,330 300,230 340,330 415,280 370,150 300,170" fill="#CBB89D" stroke="#A89478" stroke-width="1.5"/>
    <!-- Waist Belt with Buckle -->
    <rect x="175" y="440" width="250" height="24" rx="4" fill="#B39E82" stroke="#8E785D" stroke-width="1.5"/>
    <rect x="285" y="435" width="30" height="34" rx="3" fill="#D6C7AF" stroke="#685640" stroke-width="2"/>
    <!-- Tortoiseshell Double-Breasted Buttons -->
    <circle cx="260" cy="360" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
    <circle cx="340" cy="360" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
    <circle cx="260" cy="405" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
    <circle cx="340" cy="405" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
    <circle cx="260" cy="510" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
    <circle cx="340" cy="510" r="7" fill="#4A3425" stroke="#2B1D14" stroke-width="1.5"/>
  </g>
</svg>""",

    # 0918522003: Oversized Wool Blend Coat (Collections, Outerwear, Grey)
    "0918522003.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F5F5F3"/>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="wool-grey" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5A5A60"/>
      <stop offset="50%" stop-color="#46464B"/>
      <stop offset="100%" stop-color="#343438"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <!-- Oversized Dropped Shoulder Wool Silhouette -->
    <path d="M 225 155 L 120 215 L 85 520 L 140 535 L 175 350 L 155 720 L 445 720 L 425 350 L 460 535 L 515 520 L 480 215 L 375 155 Z" fill="url(#wool-grey)"/>
    <!-- Minimalist Notch Collar -->
    <polygon points="225,155 195,300 270,360 300,420 300,720 302,420 330,360 405,300 375,155 300,175" fill="#3D3D42" stroke="#29292C" stroke-width="1.5"/>
    <!-- Horn Buttons -->
    <circle cx="300" cy="460" r="8" fill="#1C1C1E" stroke="#525258" stroke-width="1.5"/>
    <circle cx="300" cy="540" r="8" fill="#1C1C1E" stroke="#525258" stroke-width="1.5"/>
    <circle cx="300" cy="620" r="8" fill="#1C1C1E" stroke="#525258" stroke-width="1.5"/>
    <!-- Deep Welt Pockets -->
    <rect x="185" y="530" width="80" height="9" rx="2" fill="#29292C"/>
    <rect x="335" y="530" width="80" height="9" rx="2" fill="#29292C"/>
  </g>
</svg>"""
}

for fname, content in SVGS.items():
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Generated: {fname}")

print("All studio garment SVGs generated successfully.")
