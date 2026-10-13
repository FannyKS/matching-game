#!/usr/bin/env python3
"""Generate furniture illustrations for the matching game.

SVG is used because macOS can rasterise it with the built-in qlmanage (WebKit),
so no Python imaging library, Node package or network access is required.
Each piece is drawn as flat shapes on a 512x512 canvas with a consistent
palette and outline weight, which keeps the cards legible at small sizes.

Run:  python3 tools/generate_furniture.py
"""

import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "..", "src", "Image Resources", "Furniture")

W = H = 512
BG = "#f3efe9"
INK = "#3d342c"
WOOD = "#b07c4f"
WOOD_D = "#8a5c38"
WOOD_L = "#c99b6a"
FAB = "#6d8b9e"
FAB_D = "#4f6a7a"
FAB_L = "#8fadc0"
METAL = "#5c6670"
METAL_D = "#414a52"
CUSH = "#c4574c"

STYLE = f"""
  <rect width="{W}" height="{H}" fill="{BG}"/>
  <ellipse cx="256" cy="424" rx="188" ry="26" fill="{INK}" opacity="0.10"/>
"""


def svg(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}">\n'
            f'<g stroke="{INK}" stroke-width="7" stroke-linejoin="round" '
            f'stroke-linecap="round">{STYLE}{body}</g>\n</svg>\n')


def leg(x, y, w=26, h=64, fill=WOOD_D):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="{fill}"/>'


# --- each function returns the SVG text for one piece -------------------

def armchair():
    return svg(f"""
      <path d="M150 214 L362 214 L344 300 L168 300 Z" fill="{FAB}"/>
      <rect x="164" y="120" width="184" height="106" rx="26" fill="{FAB_L}"/>
      <rect x="176" y="132" width="160" height="44" rx="18" fill="{FAB}"/>
      <rect x="118" y="196" width="52" height="112" rx="20" fill="{FAB_D}"/>
      <rect x="342" y="196" width="52" height="112" rx="20" fill="{FAB_D}"/>
      <rect x="170" y="272" width="172" height="52" rx="20" fill="{CUSH}"/>
      {leg(184, 318, 30, 78)}{leg(298, 318, 30, 78)}
    """)


def sofa():
    return svg(f"""
      <rect x="96" y="126" width="320" height="118" rx="26" fill="{FAB_L}"/>
      <rect x="112" y="140" width="288" height="46" rx="18" fill="{FAB}"/>
      <rect x="86" y="212" width="340" height="62" rx="24" fill="{FAB}"/>
      <rect x="72" y="180" width="62" height="106" rx="24" fill="{FAB_D}"/>
      <rect x="378" y="180" width="62" height="106" rx="24" fill="{FAB_D}"/>
      <path d="M180 146 L180 258 M332 146 L332 258" fill="none" stroke="{FAB_D}" stroke-width="6"/>
      {leg(120, 268, 30, 74)}{leg(362, 268, 30, 74)}
    """)


def dining_chair():
    return svg(f"""
      <rect x="176" y="96" width="160" height="20" rx="9" fill="{WOOD_L}"/>
      <rect x="176" y="140" width="160" height="20" rx="9" fill="{WOOD_L}"/>
      <rect x="176" y="184" width="160" height="20" rx="9" fill="{WOOD_L}"/>
      <rect x="166" y="92" width="24" height="132" rx="10" fill="{WOOD}"/>
      <rect x="322" y="92" width="24" height="132" rx="10" fill="{WOOD}"/>
      <rect x="152" y="224" width="208" height="26" rx="11" fill="{WOOD_L}"/>
      {leg(160, 250, 26, 96)}{leg(326, 250, 26, 96)}
    """)


def coffee_table():
    return svg(f"""
      <rect x="76" y="196" width="360" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="104" y="220" width="304" height="18" rx="8" fill="{WOOD_D}"/>
      {leg(100, 238, 26, 122)}{leg(386, 238, 26, 122)}
      <rect x="120" y="292" width="272" height="16" rx="7" fill="{WOOD}"/>
      <rect x="150" y="160" width="86" height="34" rx="7" fill="{CUSH}"/>
      <rect x="244" y="168" width="66" height="26" rx="7" fill="{FAB}"/>
    """)


def side_table():
    return svg(f"""
      <rect x="140" y="118" width="232" height="22" rx="10" fill="{WOOD_L}"/>
      <rect x="168" y="140" width="176" height="126" rx="12" fill="{WOOD}"/>
      <rect x="180" y="156" width="152" height="44" rx="8" fill="{WOOD_L}"/>
      <circle cx="256" cy="178" r="9" fill="{WOOD_D}"/>
      <rect x="180" y="212" width="152" height="44" rx="8" fill="{WOOD_L}"/>
      <circle cx="256" cy="234" r="9" fill="{WOOD_D}"/>
      {leg(180, 266, 28, 104)}{leg(304, 266, 28, 104)}
    """)


def bed():
    return svg(f"""
      <rect x="76" y="96" width="360" height="132" rx="20" fill="{WOOD}"/>
      <rect x="76" y="176" width="360" height="26" rx="10" fill="{WOOD_D}"/>
      <rect x="60" y="198" width="392" height="86" rx="20" fill="#fbf8f3"/>
      <path d="M60 246 L452 246 L452 264 L60 264 Z" fill="{FAB_L}"/>
      <rect x="96" y="206" width="132" height="42" rx="18" fill="#ffffff"/>
      <rect x="284" y="206" width="132" height="42" rx="18" fill="#ffffff"/>
      {leg(76, 282, 30, 84)}{leg(406, 282, 30, 84)}
    """)


def wardrobe():
    return svg(f"""
      <rect x="120" y="66" width="272" height="270" rx="16" fill="{WOOD}"/>
      <rect x="136" y="82" width="118" height="238" rx="10" fill="{WOOD_L}"/>
      <rect x="258" y="82" width="118" height="238" rx="10" fill="{WOOD_L}"/>
      <rect x="242" y="188" width="12" height="40" rx="6" fill="{WOOD_D}"/>
      <rect x="258" y="188" width="12" height="40" rx="6" fill="{WOOD_D}"/>
      {leg(132, 330, 28, 44)}{leg(352, 330, 28, 44)}
    """)


def bookshelf():
    return svg(f"""
      <rect x="132" y="58" width="248" height="300" rx="14" fill="{WOOD}"/>
      <rect x="148" y="76" width="216" height="264" rx="8" fill="{WOOD_D}"/>
      <rect x="148" y="150" width="216" height="16" fill="{WOOD_L}"/>
      <rect x="148" y="232" width="216" height="16" fill="{WOOD_L}"/>
      <rect x="164" y="94" width="26" height="56" rx="5" fill="{CUSH}"/>
      <rect x="196" y="104" width="26" height="46" rx="5" fill="{FAB_L}"/>
      <rect x="228" y="88" width="26" height="62" rx="5" fill="#d8a24a"/>
      <rect x="164" y="172" width="26" height="60" rx="5" fill="#7fa06b"/>
      <rect x="196" y="182" width="26" height="50" rx="5" fill="{CUSH}"/>
      <rect x="164" y="256" width="26" height="60" rx="5" fill="#d8a24a"/>
      <rect x="196" y="248" width="26" height="68" rx="5" fill="{FAB}"/>
      {leg(144, 352, 26, 40)}{leg(342, 352, 26, 40)}
    """)


def desk():
    return svg(f"""
      <rect x="66" y="164" width="380" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="66" y="188" width="380" height="18" rx="8" fill="{WOOD_D}"/>
      <rect x="286" y="206" width="156" height="104" rx="10" fill="{WOOD}"/>
      <rect x="298" y="218" width="132" height="38" rx="7" fill="{WOOD_L}"/>
      <circle cx="364" cy="237" r="8" fill="{WOOD_D}"/>
      <rect x="298" y="264" width="132" height="38" rx="7" fill="{WOOD_L}"/>
      <circle cx="364" cy="283" r="8" fill="{WOOD_D}"/>
      {leg(84, 206, 26, 152)}{leg(160, 206, 26, 152)}
    """)


def desk_lamp():
    return svg(f"""
      <ellipse cx="256" cy="352" rx="96" ry="20" fill="{METAL_D}"/>
      <rect x="246" y="212" width="20" height="140" fill="{METAL}"/>
      <path d="M186 212 L326 212 L292 140 L220 140 Z" fill="{METAL}"/>
      <path d="M226 150 L286 150 L292 138 L220 138 Z" fill="#ffe9a8" stroke="none"/>
      <circle cx="256" cy="120" r="16" fill="#fff3c4"/>
    """)


def office_chair():
    return svg(f"""
      <rect x="176" y="72" width="160" height="140" rx="26" fill="{METAL_D}"/>
      <rect x="196" y="92" width="120" height="98" rx="18" fill="{FAB}"/>
      <rect x="164" y="212" width="184" height="34" rx="16" fill="{METAL_D}"/>
      <rect x="240" y="246" width="32" height="72" rx="10" fill="{METAL}"/>
      <path d="M256 318 L150 372 M256 318 L362 372 M256 318 L256 380"
            fill="none" stroke="{METAL}" stroke-width="16"/>
      <circle cx="146" cy="378" r="15" fill="{METAL_D}"/>
      <circle cx="366" cy="378" r="15" fill="{METAL_D}"/>
      <circle cx="256" cy="386" r="15" fill="{METAL_D}"/>
    """)


def tv_stand():
    return svg(f"""
      <rect x="72" y="286" width="368" height="26" rx="11" fill="{WOOD_L}"/>
      <rect x="72" y="312" width="368" height="18" rx="8" fill="{WOOD_D}"/>
      <rect x="100" y="212" width="150" height="74" rx="9" fill="{WOOD}"/>
      <rect x="262" y="212" width="150" height="74" rx="9" fill="{WOOD}"/>
      <rect x="236" y="238" width="12" height="30" rx="6" fill="{WOOD_D}"/>
      <rect x="264" y="238" width="12" height="30" rx="6" fill="{WOOD_D}"/>
      <rect x="128" y="96" width="256" height="120" rx="12" fill="{METAL_D}"/>
      <rect x="142" y="110" width="228" height="92" rx="6" fill="#5f7d8c"/>
      {leg(84, 330, 26, 56)}{leg(402, 330, 26, 56)}
    """)


def cabinet():
    return svg(f"""
      <rect x="112" y="118" width="288" height="204" rx="14" fill="{WOOD}"/>
      <rect x="128" y="134" width="256" height="18" rx="8" fill="{WOOD_L}"/>
      <rect x="128" y="164" width="120" height="66" rx="8" fill="{WOOD_L}"/>
      <rect x="264" y="164" width="120" height="66" rx="8" fill="{WOOD_L}"/>
      <rect x="128" y="242" width="120" height="66" rx="8" fill="{WOOD_L}"/>
      <rect x="264" y="242" width="120" height="66" rx="8" fill="{WOOD_L}"/>
      <circle cx="240" cy="197" r="8" fill="{WOOD_D}"/>
      <circle cx="272" cy="197" r="8" fill="{WOOD_D}"/>
      <circle cx="240" cy="275" r="8" fill="{WOOD_D}"/>
      <circle cx="272" cy="275" r="8" fill="{WOOD_D}"/>
      {leg(124, 322, 28, 62)}{leg(360, 322, 28, 62)}
    """)


def nightstand():
    return svg(f"""
      <rect x="150" y="146" width="212" height="164" rx="14" fill="{WOOD}"/>
      <rect x="136" y="130" width="240" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="166" y="172" width="180" height="52" rx="9" fill="{WOOD_L}"/>
      <circle cx="256" cy="198" r="9" fill="{WOOD_D}"/>
      <rect x="166" y="238" width="180" height="52" rx="9" fill="{WOOD_L}"/>
      <circle cx="256" cy="264" r="9" fill="{WOOD_D}"/>
      {leg(166, 310, 26, 74)}{leg(320, 310, 26, 74)}
    """)


def ottoman():
    return svg(f"""
      <rect x="128" y="176" width="256" height="118" rx="26" fill="{CUSH}"/>
      <rect x="128" y="176" width="256" height="34" rx="17" fill="#d9705f"/>
      <path d="M200 210 L200 286 M312 210 L312 286" fill="none" stroke="#a8453c" stroke-width="6"/>
      {leg(146, 292, 28, 76)}{leg(338, 292, 28, 76)}
      <circle cx="256" cy="140" r="12" fill="{WOOD_D}"/>
      <rect x="244" y="150" width="24" height="30" rx="8" fill="{WOOD}"/>
    """)


def mirror():
    return svg(f"""
      <ellipse cx="256" cy="152" rx="104" ry="104" fill="{WOOD_L}"/>
      <ellipse cx="256" cy="152" rx="82" ry="82" fill="#dfe9ee"/>
      <path d="M214 116 L256 92 L256 212 L214 212 Z" fill="#ffffff" opacity="0.55" stroke="none"/>
      <rect x="240" y="252" width="32" height="94" fill="{WOOD}"/>
      <rect x="180" y="340" width="152" height="22" rx="10" fill="{WOOD_D}"/>
    """)


def coat_rack():
    return svg(f"""
      <ellipse cx="256" cy="392" rx="96" ry="20" fill="{WOOD_D}"/>
      <rect x="240" y="108" width="32" height="284" fill="{WOOD}"/>
      <rect x="140" y="150" width="232" height="22" rx="10" fill="{WOOD_L}"/>
      <path d="M164 172 L164 206 M300 172 L300 206" fill="none" stroke="{WOOD_D}" stroke-width="12"/>
      <circle cx="164" cy="216" r="14" fill="{METAL}"/>
      <circle cx="300" cy="216" r="14" fill="{METAL}"/>
      <circle cx="256" cy="92" r="20" fill="{WOOD_L}"/>
      <path d="M212 190 L300 190 L292 300 L220 300 Z" fill="{FAB}"/>
      <path d="M212 190 L196 246 M300 190 L316 246" fill="none" stroke="{FAB_D}" stroke-width="18"/>
    """)


def rocking_chair():
    return svg(f"""
      <rect x="182" y="112" width="150" height="18" rx="8" fill="{WOOD_L}"/>
      <rect x="182" y="152" width="150" height="18" rx="8" fill="{WOOD_L}"/>
      <rect x="174" y="106" width="22" height="80" rx="9" fill="{WOOD}"/>
      <rect x="318" y="106" width="22" height="80" rx="9" fill="{WOOD}"/>
      <rect x="156" y="212" width="200" height="26" rx="11" fill="{WOOD_L}"/>
      <path d="M176 238 L146 366 M336 238 L366 366" fill="none" stroke="{WOOD}" stroke-width="20"/>
      <path d="M118 372 Q256 414 394 372" fill="none" stroke="{WOOD_D}" stroke-width="20"/>
    """)


def dining_table():
    return svg(f"""
      <rect x="54" y="164" width="404" height="26" rx="12" fill="{WOOD_L}"/>
      <rect x="54" y="190" width="404" height="18" rx="8" fill="{WOOD_D}"/>
      {leg(84, 208, 30, 166)}{leg(398, 208, 30, 166)}
      <rect x="114" y="240" width="284" height="14" rx="6" fill="{WOOD}"/>
      <ellipse cx="256" cy="140" rx="34" ry="14" fill="#7fa06b"/>
      <rect x="248" y="118" width="16" height="26" rx="6" fill="#5f8350"/>
    """)


def shoe_rack():
    return svg(f"""
      <rect x="112" y="120" width="288" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="112" y="248" width="288" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="112" y="120" width="24" height="152" rx="9" fill="{WOOD}"/>
      <rect x="376" y="120" width="24" height="152" rx="9" fill="{WOOD}"/>
      <path d="M150 244 L150 152 M226 244 L226 152 M302 244 L302 152"
            fill="none" stroke="{WOOD_D}" stroke-width="12"/>
      <rect x="132" y="196" width="76" height="46" rx="10" fill="{FAB}"/>
      <rect x="304" y="196" width="76" height="46" rx="10" fill="{CUSH}"/>
      <rect x="222" y="326" width="68" height="40" rx="10" fill="#d8a24a"/>
      {leg(124, 272, 26, 62)}{leg(362, 272, 26, 62)}
    """)


def bench():
    return svg(f"""
      <rect x="108" y="118" width="24" height="150" rx="10" fill="{WOOD}"/>
      <rect x="380" y="118" width="24" height="150" rx="10" fill="{WOOD}"/>
      <rect x="132" y="140" width="248" height="22" rx="9" fill="{WOOD_L}"/>
      <rect x="132" y="182" width="248" height="22" rx="9" fill="{WOOD_L}"/>
      <rect x="80" y="244" width="352" height="28" rx="12" fill="{WOOD_L}"/>
      <rect x="92" y="272" width="328" height="16" rx="7" fill="{WOOD_D}"/>
      {leg(104, 288, 28, 76)}{leg(380, 288, 28, 76)}
    """)


def stool():
    return svg(f"""
      <rect x="206" y="198" width="24" height="158" rx="10" fill="{WOOD_D}"/>
      <rect x="282" y="198" width="24" height="158" rx="10" fill="{WOOD_D}"/>
      <rect x="180" y="208" width="24" height="148" rx="10" fill="{WOOD}"/>
      <rect x="308" y="208" width="24" height="148" rx="10" fill="{WOOD}"/>
      <rect x="170" y="180" width="172" height="30" rx="14" fill="{WOOD_L}"/>
      <path d="M192 300 L320 300" fill="none" stroke="{WOOD_D}" stroke-width="12"/>
    """)


def bunk_bed():
    return svg(f"""
      <rect x="98" y="76" width="26" height="330" rx="10" fill="{WOOD}"/>
      <rect x="388" y="76" width="26" height="330" rx="10" fill="{WOOD}"/>
      <rect x="124" y="112" width="264" height="34" rx="10" fill="#fbf8f3"/>
      <rect x="124" y="146" width="264" height="14" fill="{FAB_L}"/>
      <rect x="124" y="264" width="264" height="34" rx="10" fill="#fbf8f3"/>
      <rect x="124" y="298" width="264" height="14" fill="{FAB_L}"/>
      <rect x="138" y="112" width="64" height="26" rx="10" fill="#ffffff"/>
      <rect x="138" y="264" width="64" height="26" rx="10" fill="#ffffff"/>
      <path d="M256 150 L256 258" fill="none" stroke="{WOOD}" stroke-width="14"/>
      <path d="M186 200 L326 200 M186 226 L326 226" fill="none" stroke="{WOOD_L}" stroke-width="10"/>
    """)


def crib():
    return svg(f"""
      <rect x="102" y="128" width="24" height="210" rx="9" fill="{WOOD}"/>
      <rect x="386" y="128" width="24" height="210" rx="9" fill="{WOOD}"/>
      <rect x="102" y="150" width="308" height="22" rx="10" fill="{WOOD_L}"/>
      <rect x="102" y="300" width="308" height="26" rx="11" fill="{WOOD}"/>
      <path d="M150 172 L150 300 M186 172 L186 300 M222 172 L222 300 M258 172 L258 300 M294 172 L294 300 M330 172 L330 300 M362 172 L362 300" fill="none" stroke="{WOOD_L}" stroke-width="10"/>
      {leg(114, 326, 24, 54)}{leg(376, 326, 24, 54)}
    """)


def dresser():
    return svg(f"""
      <rect x="118" y="120" width="276" height="248" rx="14" fill="{WOOD}"/>
      <rect x="134" y="136" width="244" height="52" rx="8" fill="{WOOD_L}"/>
      <rect x="134" y="198" width="244" height="52" rx="8" fill="{WOOD_L}"/>
      <rect x="134" y="260" width="244" height="52" rx="8" fill="{WOOD_L}"/>
      <rect x="134" y="322" width="244" height="30" rx="8" fill="{WOOD_L}"/>
      <circle cx="256" cy="162" r="9" fill="{WOOD_D}"/>
      <circle cx="256" cy="224" r="9" fill="{WOOD_D}"/>
      <circle cx="256" cy="286" r="9" fill="{WOOD_D}"/>
      <circle cx="196" cy="337" r="8" fill="{WOOD_D}"/>
      <circle cx="316" cy="337" r="8" fill="{WOOD_D}"/>
      {leg(130, 368, 28, 44)}{leg(354, 368, 28, 44)}
    """)


def filing_cabinet():
    return svg(f"""
      <rect x="156" y="84" width="200" height="326" rx="12" fill="{METAL}"/>
      <rect x="172" y="100" width="168" height="68" rx="7" fill="#6f7a84"/>
      <rect x="172" y="178" width="168" height="68" rx="7" fill="#6f7a84"/>
      <rect x="172" y="256" width="168" height="68" rx="7" fill="#6f7a84"/>
      <rect x="172" y="334" width="168" height="60" rx="7" fill="#6f7a84"/>
      <rect x="216" y="126" width="80" height="14" rx="7" fill="{METAL_D}"/>
      <rect x="216" y="204" width="80" height="14" rx="7" fill="{METAL_D}"/>
      <rect x="216" y="282" width="80" height="14" rx="7" fill="{METAL_D}"/>
      <rect x="216" y="356" width="80" height="14" rx="7" fill="{METAL_D}"/>
    """)


def high_chair():
    return svg(f"""
      <rect x="204" y="92" width="104" height="112" rx="18" fill="{WOOD_L}"/>
      <rect x="156" y="200" width="200" height="26" rx="11" fill="{WOOD}"/>
      <rect x="138" y="226" width="236" height="18" rx="9" fill="{WOOD_L}"/>
      {leg(166, 226, 22, 154)}{leg(324, 226, 22, 154)}
      <rect x="182" y="304" width="148" height="14" rx="7" fill="{WOOD_L}"/>
    """)


def hutch():
    return svg(f"""
      <rect x="118" y="70" width="276" height="150" rx="12" fill="{WOOD}"/>
      <rect x="134" y="86" width="244" height="118" rx="8" fill="{WOOD_D}"/>
      <rect x="134" y="140" width="244" height="12" fill="{WOOD_L}"/>
      <rect x="154" y="106" width="22" height="34" rx="5" fill="{CUSH}"/>
      <rect x="184" y="112" width="22" height="28" rx="5" fill="{FAB_L}"/>
      <rect x="214" y="102" width="22" height="38" rx="5" fill="#d8a24a"/>
      <rect x="154" y="166" width="22" height="34" rx="5" fill="#7fa06b"/>
      <rect x="184" y="172" width="22" height="28" rx="5" fill="{CUSH}"/>
      <rect x="110" y="230" width="292" height="150" rx="12" fill="{WOOD}"/>
      <rect x="126" y="246" width="120" height="118" rx="8" fill="{WOOD_L}"/>
      <rect x="266" y="246" width="120" height="118" rx="8" fill="{WOOD_L}"/>
      <circle cx="238" cy="305" r="8" fill="{WOOD_D}"/>
      <circle cx="274" cy="305" r="8" fill="{WOOD_D}"/>
      {leg(122, 380, 26, 40)}{leg(364, 380, 26, 40)}
    """)


def ironing_board():
    return svg(f"""
      <rect x="76" y="196" width="360" height="28" rx="13" fill="#d9d3c8"/>
      <path d="M150 224 L120 372 M330 224 L360 372" fill="none" stroke="{METAL}" stroke-width="16"/>
      <path d="M138 306 L344 306" fill="none" stroke="{METAL_D}" stroke-width="12"/>
      <path d="M214 166 L288 166 L302 198 L196 198 Z" fill="{METAL}"/>
      <rect x="196" y="176" width="92" height="14" rx="6" fill="{METAL_D}"/>
      <path d="M290 174 Q322 174 318 194" fill="none" stroke="{METAL_D}" stroke-width="8"/>
    """)


def ladder():
    return svg(f"""
      <path d="M182 66 L182 402 M332 66 L332 402" fill="none" stroke="{WOOD}" stroke-width="22"/>
      <path d="M182 140 L332 140 M182 208 L332 208 M182 276 L332 276 M182 344 L332 344" fill="none" stroke="{WOOD_L}" stroke-width="16"/>
    """)


def vanity():
    return svg(f"""
      <ellipse cx="256" cy="132" rx="54" ry="62" fill="{WOOD_D}"/>
      <ellipse cx="256" cy="132" rx="40" ry="48" fill="#dbe7ee"/>
      <rect x="120" y="200" width="272" height="26" rx="12" fill="{WOOD_L}"/>
      <rect x="150" y="226" width="212" height="92" rx="10" fill="{WOOD}"/>
      <rect x="162" y="240" width="88" height="30" rx="7" fill="{WOOD_L}"/>
      <rect x="262" y="240" width="88" height="30" rx="7" fill="{WOOD_L}"/>
      <rect x="162" y="278" width="88" height="30" rx="7" fill="{WOOD_L}"/>
      <rect x="262" y="278" width="88" height="30" rx="7" fill="{WOOD_L}"/>
      {leg(134, 318, 24, 86)}{leg(354, 318, 24, 86)}
    """)


def console_table():
    return svg(f"""
      <rect x="66" y="196" width="380" height="24" rx="11" fill="{WOOD_L}"/>
      <rect x="66" y="220" width="380" height="14" rx="7" fill="{WOOD_D}"/>
      <rect x="104" y="234" width="22" height="150" rx="10" fill="{WOOD}"/>
      <rect x="386" y="234" width="22" height="150" rx="10" fill="{WOOD}"/>
      <rect x="150" y="256" width="212" height="72" rx="9" fill="{WOOD}"/>
      <rect x="164" y="268" width="184" height="20" rx="6" fill="{WOOD_L}"/>
      <rect x="164" y="296" width="184" height="20" rx="6" fill="{WOOD_L}"/>
    """)


def recliner():
    return svg(f"""
      <rect x="184" y="118" width="168" height="104" rx="26" fill="{FAB_L}"/>
      <rect x="120" y="196" width="52" height="108" rx="22" fill="{FAB_D}"/>
      <rect x="340" y="196" width="52" height="108" rx="22" fill="{FAB_D}"/>
      <rect x="164" y="214" width="184" height="70" rx="24" fill="{FAB}"/>
      <rect x="150" y="270" width="256" height="34" rx="16" fill="{FAB}"/>
      {leg(170, 304, 28, 74)}{leg(314, 304, 28, 74)}
    """)


def storage_chest():
    return svg(f"""
      <rect x="118" y="184" width="276" height="60" rx="14" fill="{WOOD_L}"/>
      <rect x="118" y="232" width="276" height="132" rx="12" fill="{WOOD}"/>
      <rect x="124" y="244" width="264" height="14" fill="{WOOD_D}"/>
      <rect x="236" y="226" width="40" height="48" rx="9" fill="{METAL}"/>
      <rect x="150" y="352" width="212" height="14" rx="7" fill="{WOOD_D}"/>
      {leg(132, 364, 24, 40)}{leg(356, 364, 24, 40)}
    """)


def pouf():
    return svg(f"""
      <rect x="140" y="220" width="232" height="112" rx="28" fill="{CUSH}"/>
      <ellipse cx="256" cy="220" rx="116" ry="34" fill="#d9705f"/>
      <path d="M232 232 L232 326 M280 232 L280 326" fill="none" stroke="#a8453c" stroke-width="6"/>
      <ellipse cx="256" cy="214" rx="10" ry="6" fill="#a8453c"/>
    """)


PIECES = [
    ("armchair", armchair), ("sofa", sofa), ("dining-chair", dining_chair),
    ("coffee-table", coffee_table), ("side-table", side_table), ("bed", bed),
    ("wardrobe", wardrobe), ("bookshelf", bookshelf), ("writing-desk", desk),
    ("desk-lamp", desk_lamp), ("office-chair", office_chair),
    ("tv-stand", tv_stand), ("sideboard", cabinet), ("nightstand", nightstand),
    ("ottoman", ottoman), ("wall-mirror", mirror), ("coat-rack", coat_rack),
    ("rocking-chair", rocking_chair), ("dining-table", dining_table),
    ("shoe-rack", shoe_rack),
    ("bench", bench), ("stool", stool), ("bunk-bed", bunk_bed),
    ("crib", crib), ("dresser", dresser), ("filing-cabinet", filing_cabinet),
    ("high-chair", high_chair), ("hutch", hutch),
    ("ironing-board", ironing_board), ("ladder", ladder), ("vanity", vanity),
    ("console-table", console_table), ("recliner", recliner),
    ("storage-chest", storage_chest), ("pouf", pouf),
]


def main():
    out = os.path.normpath(OUT)
    os.makedirs(out, exist_ok=True)
    for name, fn in PIECES:
        path = os.path.join(out, name + ".svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(fn())
        print("  wrote " + os.path.basename(path))
    print(f"\n{len(PIECES)} images in {out}")


if __name__ == "__main__":
    main()