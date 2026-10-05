#!/usr/bin/env python3
"""Build the SAGE call briefing as a readable, well-structured PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Flowable,
)

OUT = "/home/user/brsr-consultant-kit/docs/SAGE-call-briefing.pdf"

NAVY   = colors.HexColor("#0F1E33")
BLUE   = colors.HexColor("#0B6FD4")
BLUEL  = colors.HexColor("#EAF4FE")
BLUEB  = colors.HexColor("#CDE2F6")
CORAL  = colors.HexColor("#C2410C")
CORALL = colors.HexColor("#FEF1EC")
CORALB = colors.HexColor("#F6CBBC")
GREEN  = colors.HexColor("#0F7A52")
GREENL = colors.HexColor("#ECFAF3")
INK    = colors.HexColor("#1A2430")
BODY   = colors.HexColor("#333F4D")
MUTED  = colors.HexColor("#6B7785")
LINE   = colors.HexColor("#DCE3EA")
BAND   = colors.HexColor("#F6F8FA")

PW, PH = A4
MARGIN = 17 * mm
CW = PW - 2 * MARGIN   # content width ≈ 462pt

S = {}
S["h1"] = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=21, leading=25,
                         textColor=NAVY, spaceBefore=0, spaceAfter=3)
S["eyebrow"] = ParagraphStyle("eyebrow", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                              textColor=BLUE, spaceAfter=5)
S["h2"] = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17,
                         textColor=NAVY, spaceBefore=15, spaceAfter=5)
S["h3"] = ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=11, leading=14,
                         textColor=BLUE, spaceBefore=11, spaceAfter=3)
S["body"] = ParagraphStyle("body", fontName="Helvetica", fontSize=9.8, leading=14.2,
                           textColor=BODY, spaceAfter=7, alignment=TA_LEFT)
S["lead"] = ParagraphStyle("lead", fontName="Helvetica", fontSize=11, leading=16,
                           textColor=INK, spaceAfter=9)
S["bullet"] = ParagraphStyle("bullet", parent=S["body"], leftIndent=13, bulletIndent=2,
                             spaceAfter=4.5)
S["quote"] = ParagraphStyle("quote", fontName="Helvetica-Oblique", fontSize=10.2, leading=15.5,
                            textColor=NAVY, leftIndent=11, rightIndent=8, spaceAfter=8)
S["th"] = ParagraphStyle("th", fontName="Helvetica-Bold", fontSize=8.6, leading=11.2,
                         textColor=colors.white)
S["td"] = ParagraphStyle("td", fontName="Helvetica", fontSize=8.8, leading=12,
                         textColor=BODY)
S["tdb"] = ParagraphStyle("tdb", fontName="Helvetica-Bold", fontSize=8.8, leading=12,
                          textColor=INK)
S["boxh"] = ParagraphStyle("boxh", fontName="Helvetica-Bold", fontSize=9.2, leading=12,
                           textColor=CORAL, spaceAfter=3)
S["boxb"] = ParagraphStyle("boxb", fontName="Helvetica", fontSize=9.4, leading=13.6,
                           textColor=INK, spaceAfter=5)
S["cover_t"] = ParagraphStyle("cover_t", fontName="Helvetica-Bold", fontSize=31, leading=35,
                              textColor=colors.white, spaceAfter=10)
S["cover_s"] = ParagraphStyle("cover_s", fontName="Helvetica", fontSize=12.5, leading=18,
                              textColor=colors.HexColor("#C4D0E0"))
S["toc"] = ParagraphStyle("toc", fontName="Helvetica", fontSize=10.2, leading=19,
                          textColor=BODY)
S["small"] = ParagraphStyle("small", fontName="Helvetica", fontSize=8.4, leading=11.5,
                            textColor=MUTED, spaceAfter=5)


class Rule(Flowable):
    def __init__(self, w=CW, thickness=2, color=BLUE, space=5):
        Flowable.__init__(self)
        self.w, self.t, self.c, self.space = w, thickness, color, space
        self.height = thickness + space

    def wrap(self, aw, ah):
        return (self.w, self.height)

    def draw(self):
        self.canv.setStrokeColor(self.c)
        self.canv.setLineWidth(self.t)
        self.canv.line(0, self.space, self.w, self.space)


def box(title, paras, tone="warn"):
    """A callout. tone: warn (coral), info (blue), good (green)."""
    bg, bd, tc = {
        "warn": (CORALL, CORALB, CORAL),
        "info": (BLUEL, BLUEB, BLUE),
        "good": (GREENL, colors.HexColor("#BCE5D2"), GREEN),
    }[tone]
    inner = []
    if title:
        inner.append(Paragraph(title.upper(), ParagraphStyle(
            "bh", parent=S["boxh"], textColor=tc)))
    for p in paras:
        inner.append(Paragraph(p, S["boxb"]))
    if inner and hasattr(inner[-1], "style"):
        inner[-1].style = ParagraphStyle("last", parent=inner[-1].style, spaceAfter=0)
    t = Table([[inner]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.9, bd),
        ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def table(headers, rows, widths, bold_first=False, header_bg=NAVY):
    data = [[Paragraph(h, S["th"]) for h in headers]]
    for r in rows:
        cells = []
        for i, c in enumerate(r):
            st = S["tdb"] if (bold_first and i == 0) else S["td"]
            cells.append(Paragraph(c, st))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), BAND))
    t.setStyle(TableStyle(style))
    return t


def bullets(items, style=None):
    return [Paragraph(f"&bull;&nbsp;&nbsp;{i}", style or S["bullet"]) for i in items]


def part(num, title, sub=None):
    out = [Paragraph(f"PART {num}", S["eyebrow"]), Paragraph(title, S["h1"]), Rule()]
    if sub:
        out.append(Spacer(1, 4))
        out.append(Paragraph(sub, S["lead"]))
    return out


# ───────────────────────── document scaffolding ─────────────────────────
class Doc(BaseDocTemplate):
    def __init__(self, path):
        BaseDocTemplate.__init__(
            self, path, pagesize=A4,
            leftMargin=MARGIN, rightMargin=MARGIN, topMargin=20 * mm, bottomMargin=16 * mm,
            title="SAGE Call Briefing — Saaksh",
            author="Prepared for Rahul Upadhyay",
            subject="BRSR, CDP, EcoVadis, GRESB and the call with Dr. Shashi Kad",
        )
        frame = Frame(MARGIN, 16 * mm, CW, PH - 36 * mm, id="body")
        cover = Frame(MARGIN, 16 * mm, CW, PH - 32 * mm, id="cover")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover], onPage=self.paint_cover),
            PageTemplate(id="body", frames=[frame], onPage=self.paint_body),
        ])

    def paint_cover(self, canv, doc):
        canv.saveState()
        canv.setFillColor(NAVY)
        canv.rect(0, 0, PW, PH, stroke=0, fill=1)
        canv.setFillColor(BLUE)
        canv.rect(0, PH - 6, PW, 6, stroke=0, fill=1)
        canv.restoreState()

    def paint_body(self, canv, doc):
        canv.saveState()
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(MARGIN, PH - 15 * mm, PW - MARGIN, PH - 15 * mm)
        canv.setFont("Helvetica", 7.6)
        canv.setFillColor(MUTED)
        canv.drawString(MARGIN, PH - 13.4 * mm, "SAGE call briefing  ·  Dr. Shashi Kad  ·  prepared 5 October 2026")
        canv.drawRightString(PW - MARGIN, 10 * mm, str(doc.page))
        canv.restoreState()


story = []

# ═══════════════════════════════ COVER ═══════════════════════════════
story.append(Spacer(1, 62 * mm))
story.append(Paragraph("Everything you need<br/>to know, from zero", S["cover_t"]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "The call with <b>Dr. Shashi Kad</b><br/>Founder &amp; Chief Sustainability Strategist, "
    "SAGE Sustainability", S["cover_s"]))
story.append(Spacer(1, 26))

cov = Table([[
    Paragraph("This document assumes you know nothing about sustainability reporting. "
              "It is self-contained — you do not need any other file.<br/><br/>"
              "<b>Read it top to bottom once. Then re-read Parts 1, 2 and 9.</b>",
              ParagraphStyle("cv", fontName="Helvetica", fontSize=10.6, leading=16,
                             textColor=colors.white))
]], colWidths=[CW - 20])
cov.setStyle(TableStyle([
    ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 13), ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#17293F")),
    ("LINEBEFORE", (0, 0), (0, -1), 3, BLUE),
]))
story.append(cov)
story.append(Spacer(1, 30))
story.append(Paragraph(
    "Prepared 5 October 2026  ·  Saaksh  ·  saaksh.co",
    ParagraphStyle("f", fontName="Helvetica", fontSize=8.6, leading=12,
                   textColor=colors.HexColor("#7D8FA6"))))

# ═══════════════════════════════ CONTENTS ═══════════════════════════════
story.append(PageBreak())
story.append(Paragraph("What is in here", S["h1"]))
story.append(Rule())
story.append(Spacer(1, 8))

toc_rows = [
    ("1", "Why this entire industry exists", "The idea everything else follows from"),
    ("2", "Every term, spelled out", "Including three you must NOT spell out"),
    ("3", "BRSR, properly", "The one you must know cold"),
    ("4", "CDP, EcoVadis, GRESB — and how they connect", "The insight your product rests on"),
    ("5", "Who she is, and what SAGE does", "Including the phrase to borrow"),
    ("6", "The email problem", "And the one thing to do before the call"),
    ("7", "What you have actually built", "In order of how finished it is"),
    ("8", "Things you must never say", "The guard rails"),
    ("9", "The call itself", "Opening, demo, questions, the ask"),
    ("10", "The fifteen things to recall", "If you remember nothing else"),
]
t = table(["", "Part", "What it covers"],
          [(n, a, b) for n, a, b in toc_rows],
          [26, 190, CW - 216], bold_first=False)
story.append(t)
story.append(Spacer(1, 14))
story.append(box("The three things that matter most", [
    "<b>1.</b> This field turns &ldquo;we care about the environment&rdquo; into numbers somebody can check. "
    "That is also what Saaksh is for — and the one thing you and she already agree on.",
    "<b>2.</b> Your email's &ldquo;collect once, map across four frameworks&rdquo; is <b>now built for "
    "the three things the email named &mdash; energy, water and people.</b> Part 7 gives you the exact "
    "sentence to say, and names what is still not covered.",
    "<b>3.</b> <b>Go and read her article before the call.</b> Ten minutes. Part 6 explains why this "
    "outranks everything else in this document.",
], tone="warn"))

# ═══════════════════════════════ PART 1 ═══════════════════════════════
story.append(PageBreak())
story += part("1", "Why this entire industry exists",
              "Start here. Everything else follows from this one idea.")

story.append(Paragraph("The problem that created the field", S["h2"]))
story.append(Paragraph(
    "For a hundred years, companies reported one thing: <b>money</b>. Revenue, profit, assets, debt. "
    "Those numbers follow strict accounting standards and an independent auditor checks them. An "
    "investor can trust them and compare two companies.", S["body"]))
story.append(Paragraph(
    "Then it became obvious that <b>things which never appeared in the accounts were destroying "
    "real money</b>:", S["body"]))
story += bullets([
    "A factory that poisons a river gets shut down by the pollution board.",
    "A supplier caught using child labour loses its European customer overnight.",
    "A cement company with no plan for carbon taxes holds assets that may become worthless.",
    "A company with a hostile workplace loses its best people and gets sued.",
])
story.append(Spacer(1, 3))
story.append(Paragraph(
    "None of that showed up in a balance sheet until the damage was already done. So investors, "
    "regulators and large customers started demanding a second kind of report: <b>tell us about the "
    "environmental, social and governance side of your business.</b>", S["body"]))

story.append(Paragraph("The first attempt failed — and that failure is the opportunity", S["h2"]))
story.append(Paragraph(
    "Companies responded with glossy brochures. &ldquo;We planted 10,000 trees.&rdquo; &ldquo;We care "
    "deeply about our people.&rdquo; Beautiful photos, no numbers, nothing verifiable, nothing "
    "comparable between two companies. The word for this is <b>greenwashing</b> — looking "
    "sustainable without being sustainable.", S["body"]))
story.append(Paragraph(
    "So the world did to sustainability reporting what it had already done to financial reporting: "
    "<b>invented standards.</b> Fixed questions, fixed definitions, fixed units — and increasingly, "
    "an independent auditor to check the answers.", S["body"]))
story.append(box("The sentence that explains your whole product", [
    "This field is about turning <b>&ldquo;we care about the environment&rdquo;</b> into "
    "<b>numbers somebody can check.</b>",
    "That is why your product is called <b>Saaksh</b> (Sanskrit <i>saakshya</i> — evidence, "
    "witness) and why everything in it carries a citation. <b>You are on the side of making claims "
    "checkable.</b> If you understand nothing else, understand this. It is the one thing you and "
    "Shashi already agree on, and it is why she replied.",
], tone="info"))

story.append(Paragraph("ESG — the three buckets", S["h2"]))
story.append(Paragraph(
    "<b>ESG = Environmental, Social, Governance.</b> Every framework in this document sorts its "
    "questions into these three buckets. &ldquo;Sustainability reporting&rdquo; and &ldquo;ESG "
    "reporting&rdquo; mean the same thing in practice — use either.", S["body"]))
story.append(table(
    ["Bucket", "What is in it"],
    [("<b>E</b> — Environmental", "Energy, emissions, water, waste, air pollution, biodiversity"),
     ("<b>S</b> — Social", "Employees, wages, safety, training, human rights, communities, customers"),
     ("<b>G</b> — Governance", "Board oversight, ethics, anti-corruption, conflicts of interest, data privacy")],
    [120, CW - 120]))

story.append(Paragraph("Who demands disclosure — four audiences", S["h2"]))
story.append(Paragraph(
    "This is the single most useful idea in the document. <b>There are only four kinds of people who "
    "demand this data, and each invented its own format.</b> Every acronym you will hear belongs to "
    "one of these four boxes.", S["body"]))
story.append(table(
    ["Who demands it", "Why they care", "What they made you fill in"],
    [("<b>1. Regulators</b>", "Public interest; stop greenwashing; it is the law",
      "<b>BRSR</b> (India)<br/><b>CSRD / ESRS</b> (EU)"),
     ("<b>2. Investors</b>", "Price the risk. A carbon-exposed company is a riskier investment",
      "<b>CDP</b> · <b>TCFD</b> · <b>IFRS S1/S2</b><br/><b>MSCI</b> · <b>DJSI</b> · <b>GRESB</b>"),
     ("<b>3. Customers / buyers</b>", "&ldquo;I cannot have a scandal in my supply chain&rdquo;",
      "<b>EcoVadis</b>"),
     ("<b>4. The public</b>", "General accountability; voluntary reporting", "<b>GRI</b>")],
    [112, 178, CW - 290]))
story.append(Spacer(1, 6))
story.append(box("Use this when you are stuck", [
    "Memorise those four boxes. When she says an acronym you do not know, you can still place it: "
    "<b>&ldquo;Is that an investor-facing one, or a buyer-facing one?&rdquo;</b> That question alone "
    "sounds informed.",
], tone="good"))

story.append(Paragraph("Why this is a big deal in India right now", S["h2"]))
story.append(Paragraph(
    "<b>SEBI</b> — the Securities and Exchange Board of India, the stock market regulator — made "
    "sustainability reporting <b>mandatory</b> for the <b>top 1,000 listed companies by market "
    "capitalisation</b>, starting financial year <b>2022-23</b>. The format is called <b>BRSR</b>.", S["body"]))
story.append(Paragraph(
    "And from FY2023-24 onwards, SEBI began requiring that part of it be <b>independently checked</b> — "
    "phased in by company size. That checking requirement created an industry of consultants and "
    "auditors almost overnight. <b>That is the wave SAGE rides, and the wave your product is built "
    "on.</b>", S["body"]))

# ═══════════════════════════════ PART 2 ═══════════════════════════════
story.append(PageBreak())
story += part("2", "Every term, spelled out",
              "She has a PhD and holds four certifications. Two things cost you credibility: getting "
              "an expansion wrong, and expanding something that is no longer expanded.")

story.append(box("Three names you must NOT spell out", [
    "<b>1. CDP — never say &ldquo;Carbon Disclosure Project.&rdquo;</b> It was called that, but it "
    "<b>officially dropped the name in 2013</b> when it expanded beyond carbon into water and forests. "
    "It is now <b>CDP, full stop.</b> For credit on the history: <i>&ldquo;CDP — it used to be the "
    "Carbon Disclosure Project, before it went beyond carbon.&rdquo;</i>",
    "<b>2. EcoVadis is NOT an acronym.</b> It is the name of a French company, founded 2007. "
    "<b>There is nothing to expand.</b> If you try, you will invent something. Note the capitals: "
    "<b>E</b>co<b>V</b>adis.",
    "<b>3. GRESB — the old full form is now wrong.</b> It began as the <i>Global Real Estate "
    "Sustainability Benchmark</i>, then expanded to cover <b>infrastructure as well</b>, so they use "
    "the acronym alone. Say <b>&ldquo;GRESB.&rdquo;</b>",
    "<b>Also: MSCI</b> no longer expands either (it was Morgan Stanley Capital International).",
    "<b>Said aloud:</b> GRESB as one word, roughly <i>&ldquo;GREZ-bee.&rdquo;</i> EcoVadis, "
    "<i>&ldquo;EE-koh-VAH-dis.&rdquo;</i>",
], tone="warn"))

story.append(Paragraph("The four frameworks in your email", S["h2"]))
story.append(table(
    ["", "Full form", "Who demands it", "What you get back"],
    [("<b>BRSR</b>", "Business Responsibility and Sustainability Report",
      "SEBI — the Indian regulator. <b>Mandatory.</b>", "Nothing. Compliance."),
     ("<b>CDP</b>", "None — formerly Carbon Disclosure Project",
      "Investors and big customers", "<b>A score, A to D-</b>"),
     ("<b>EcoVadis</b>", "None — a company name",
      "Buyers / procurement", "<b>0&ndash;100 and a medal</b> (Bronze, Silver, Gold, Platinum)"),
     ("<b>GRESB</b>", "None now",
      "Investors in property and infrastructure funds", "<b>Score out of 100 and a rank</b>")],
    [62, 128, 125, CW - 315]))

story.append(Paragraph("Other frameworks you will hear", S["h2"]))
story.append(table(
    ["Acronym", "Full form", "One line"],
    [("<b>GRI</b>", "Global Reporting Initiative",
      "The oldest, most widely used <b>voluntary</b> standard. Most documents titled "
      "&ldquo;Sustainability Report&rdquo; follow GRI. <b>She is certified.</b>"),
     ("<b>TCFD</b>", "Task Force on Climate-related Financial Disclosures",
      "Climate risk for investors, in four pillars: governance, strategy, risk management, metrics "
      "&amp; targets. Now absorbed into IFRS S2."),
     ("<b>IFRS</b>", "International Financial Reporting Standards",
      "<b>S1</b> = general sustainability rules; <b>S2</b> = climate. Issued by the ISSB."),
     ("<b>ISSB</b>", "International Sustainability Standards Board",
      "The body that writes IFRS S1 and S2."),
     ("<b>CSRD</b>", "Corporate Sustainability Reporting Directive",
      "The <b>EU law</b> making sustainability reporting mandatory in Europe."),
     ("<b>ESRS</b>", "European Sustainability Reporting Standards",
      "The standards companies report against <b>under</b> CSRD."),
     ("<b>TNFD</b>", "Taskforce on Nature-related Financial Disclosures",
      "TCFD, but for nature and biodiversity instead of climate."),
     ("<b>SASB</b>", "Sustainability Accounting Standards Board",
      "Industry-specific standards; now part of the IFRS Foundation."),
     ("<b>SBTi</b>", "Science Based Targets initiative",
      "Validates that a reduction target matches climate science. Lower-case &ldquo;initiative&rdquo; "
      "is their style. <b>She is certified.</b>"),
     ("<b>MSCI</b>", "No longer expands",
      "An <b>ESG rating</b> agency. Rates AAA to CCC, mostly from public data — you often fill "
      "nothing in."),
     ("<b>DJSI</b>", "Dow Jones Sustainability Index",
      "An index of top ESG performers. You get in by scoring well on the CSA."),
     ("<b>CSA</b>", "Corporate Sustainability Assessment",
      "S&amp;P Global's questionnaire that feeds DJSI."),
     ("<b>IR</b>", "Integrated Reporting",
      "Combining financial and sustainability reporting into one report. <b>She is certified.</b>"),
     ("<b>UNGPs</b>", "UN Guiding Principles on Business and Human Rights",
      "The global reference for corporate human-rights responsibility."),
     ("<b>B Corp</b>", "Benefit Corporation",
      "A certification from a non-profit called <b>B Lab</b>. <b>SAGE is a B Corp.</b>")],
    [58, 132, CW - 190]))

story.append(PageBreak())
story.append(Paragraph("Indian bodies and regimes", S["h2"]))
story.append(table(
    ["Acronym", "Full form", "What it does"],
    [("<b>SEBI</b>", "Securities and Exchange Board of India", "Stock market regulator. <b>Mandates BRSR.</b>"),
     ("<b>MCA</b>", "Ministry of Corporate Affairs", "Writes company law. Issued the NGRBC principles."),
     ("<b>NGRBC</b>", "National Guidelines on Responsible Business Conduct",
      "The <b>nine principles</b> BRSR is built around."),
     ("<b>ICAI</b>", "Institute of Chartered Accountants of India",
      "Publishes the BRSR guidance your citations point to."),
     ("<b>BEE</b>", "Bureau of Energy Efficiency", "Runs the PAT scheme and India's carbon market."),
     ("<b>CEA</b>", "Central Electricity Authority",
      "Publishes the <b>grid emission factor</b>. Your product uses <b>Version 21.0, "
      "0.710 kg CO<sub>2</sub> per kWh, FY 2024-25.</b>"),
     ("<b>CPCB</b>", "Central Pollution Control Board", "Pollution regulator; state versions too."),
     ("<b>NSDC</b>", "National Skill Development Corporation",
      "<b>Backs Green Skills Academy, which Shashi leads. Get this right.</b>"),
     ("<b>LODR</b>", "Listing Obligations and Disclosure Requirements",
      "SEBI's regulations. Regulation 34(2)(f) requires BRSR."),
     ("<b>ISF</b>", "Industry Standards Forum",
      "Published sector-specific BRSR Core standards, December 2024."),
     ("<b>PAT</b>", "Perform, Achieve and Trade", "BEE's energy-efficiency trading scheme."),
     ("<b>CCTS</b>", "Carbon Credit Trading Scheme", "India's national carbon market."),
     ("<b>ZLD</b>", "Zero Liquid Discharge", "A plant that releases no liquid waste at all."),
     ("<b>EPR</b>", "Extended Producer Responsibility", "Producer is responsible for its product waste."),
     ("<b>CSR</b>", "Corporate Social Responsibility",
      "In India a <b>statutory 2% of average net profit</b> (Companies Act s.135). "
      "<b>India is unusual — CSR spending is a legal obligation.</b>"),
     ("<b>POSH</b>", "Prevention of Sexual Harassment", "The 2013 workplace harassment law."),
     ("<b>DPDP</b>", "Digital Personal Data Protection Act, 2023", "India's privacy law."),
     ("<b>BSE / NSE</b>", "BSE Limited / National Stock Exchange of India",
      "The exchanges where BRSR is filed.")],
    [66, 132, CW - 198]))

story.append(PageBreak())
story.append(Paragraph("Emissions vocabulary — learn this properly", S["h2"]))
story.append(Paragraph("This comes up in <b>every</b> conversation in this field.", S["body"]))
story.append(table(
    ["Term", "Full form / meaning"],
    [("<b>GHG</b>", "<b>Greenhouse gas</b> — CO<sub>2</sub>, methane and others that trap heat"),
     ("<b>GHG Protocol</b>",
      "<b>Greenhouse Gas Protocol</b> — the global accounting rulebook, from <b>WRI</b> (World "
      "Resources Institute) and <b>WBCSD</b> (World Business Council for Sustainable Development)"),
     ("<b>tCO<sub>2</sub>e</b>",
      "<b>Tonnes of carbon dioxide equivalent.</b> Different gases warm by different amounts, so "
      "everything converts to &ldquo;how much CO<sub>2</sub> would do the same damage&rdquo;"),
     ("<b>GWP</b>",
      "<b>Global Warming Potential</b> — the conversion multiplier. Methane's is about 28: one tonne "
      "of methane equals 28 tonnes CO<sub>2</sub>e over 100 years"),
     ("<b>IPCC</b>", "<b>Intergovernmental Panel on Climate Change</b> — the UN science body; your "
      "fuel factors come from it"),
     ("<b>AR5</b>", "The IPCC's <b>Fifth Assessment Report</b> — where your GWP numbers come from"),
     ("<b>Emission factor</b>",
      "The multiplier that turns activity into emissions. <i>Litres of diesel &times; 2.68 = kg "
      "CO<sub>2</sub>e.</i> <b>Revised every year — which is why your product shows the version</b>"),
     ("<b>NCV</b>", "<b>Net Calorific Value</b> — energy per unit of fuel; how litres become joules"),
     ("<b>DEFRA</b>",
      "<b>Department for Environment, Food and Rural Affairs</b> (UK). The GHG factors <b>moved to "
      "DESNZ, the Department for Energy Security and Net Zero, in 2023</b> — which is why your file "
      "says DEFRA/DESNZ"),
     ("<b>Intensity</b>",
      "Emissions <b>per unit of something</b> — per rupee of revenue, per tonne produced. Lets you "
      "compare a big company to a small one")],
    [96, CW - 96]))

story.append(Spacer(1, 10))
story.append(box("Scope 1, 2 and 3 — the single most important concept", [
    "<b>Scope 1 &mdash; what you burn.</b> Fuel burnt in things you own or control: diesel in your "
    "generator, gas in your boiler, petrol in company cars, <b>and refrigerant that leaks out of your "
    "air conditioning.</b>",
    "<b>Scope 2 &mdash; the electricity you buy.</b> You did not burn anything; the power station did. "
    "But you caused it by buying the power.",
    "<b>Scope 3 &mdash; everything else in your value chain.</b> Suppliers' emissions, business travel, "
    "commuting, freight, waste disposal, and customers using your product. <b>Usually the biggest and "
    "hardest to measure.</b>",
    "<b>Why it matters:</b> BRSR requires Scope 1 and 2. <b>Scope 3 is voluntary in BRSR</b> (it sits "
    "in the Leadership tier). CDP pushes hard on Scope 3.",
], tone="info"))
story.append(Spacer(1, 8))
story.append(box("One line that will make you sound current", [
    "<b>&ldquo;Location-based Scope 2 uses the grid average where you are. Market-based uses the "
    "renewable contracts you actually hold. CDP asks for both; BRSR asks for one.&rdquo;</b>",
    "True, specific, and exactly the detail a practitioner notices. Say it if Scope 2 comes up.",
], tone="good"))

story.append(PageBreak())
story.append(Paragraph("Assurance vocabulary", S["h2"]))
story.append(Paragraph(
    "<b>&ldquo;Assurance&rdquo; means an independent third party checked your numbers.</b> Without it, "
    "a sustainability report is just a claim.", S["body"]))
story.append(table(
    ["Term", "Meaning"],
    [("<b>Reasonable assurance</b>",
      "The <b>higher</b> bar. A positive opinion: <i>&ldquo;in our opinion these figures are fairly "
      "stated.&rdquo;</i> Expensive, lots of evidence."),
     ("<b>Limited assurance</b>",
      "The <b>lower</b> bar. <i>&ldquo;Nothing came to our attention suggesting these are "
      "wrong.&rdquo;</i> Cheaper, lighter testing."),
     ("<b>Assessment</b>",
      "A lighter review than assurance. <b>SEBI's 28 March 2025 circular allows either assessment or "
      "assurance</b> depending on size and year — never assume it must be full assurance."),
     ("<b>ISAE 3000</b>",
      "<b>International Standard on Assurance Engagements 3000</b> — the standard these engagements "
      "run under."),
     ("<b>XBRL</b>",
      "<b>eXtensible Business Reporting Language</b> — the machine-readable format BRSR is filed in."),
     ("<b>LTIFR</b>", "<b>Lost Time Injury Frequency Rate</b> — injuries causing missed work, per "
      "million hours worked."),
     ("<b>OHSMS</b>", "<b>Occupational Health and Safety Management System</b> — e.g. ISO 45001."),
     ("<b>EIA</b>", "<b>Environmental Impact Assessment</b> — study required before a big project."),
     ("<b>LCA</b>", "<b>Life Cycle Assessment</b> — a product's full footprint, raw material to disposal."),
     ("<b>CBAM</b>", "<b>Carbon Border Adjustment Mechanism</b> — the EU's carbon price on imports. "
      "Hits Indian exporters of steel, cement, aluminium, fertiliser, hydrogen, electricity."),
     ("<b>EU ETS</b>", "<b>European Union Emissions Trading System</b> — Europe's carbon market.")],
    [120, CW - 120]))

story.append(Spacer(1, 10))
story.append(box("Materiality — she will use this word", [
    "<b>Materiality means: which of these hundreds of ESG topics actually matter for THIS company.</b> "
    "A cement company's emissions are hugely material; its data privacy barely registers. A bank is "
    "the opposite.",
    "<b>You determine it by asking people</b> — employees, investors, communities, customers, "
    "suppliers. That process is <b>stakeholder engagement</b>. <b>A topic list is not a materiality "
    "assessment</b> — the assessment IS the engagement process. Your product is careful about exactly "
    "this, and it is one of its most credible features.",
    "<b>Double materiality</b> — two directions, and this phrase marks out someone who knows the field: "
    "<b>(1) Financial materiality</b> — how ESG issues affect the <b>company's</b> money (what IFRS "
    "cares about). <b>(2) Impact materiality</b> — how the <b>company affects the world</b> (what GRI "
    "cares about). <b>The EU requires both.</b>",
], tone="info"))

# ═══════════════════════════════ PART 3 ═══════════════════════════════
story.append(PageBreak())
story += part("3", "BRSR, properly",
              "This is the one you must know cold. It is your product's subject.")
story.append(Paragraph(
    "<b>BRSR = Business Responsibility and Sustainability Report.</b> Mandated by SEBI. Filed with the "
    "stock exchange as part of the annual report.", S["lead"]))

story.append(Paragraph("Who has to file it", S["h2"]))
story += bullets([
    "<b>Top 1,000 listed companies by market capitalisation</b> — mandatory since <b>FY 2022-23</b>",
    "Everyone else — voluntary",
    "<b>An unlisted company is NOT automatically required to file</b>, even if it supplies a listed "
    "one. It may be <i>asked</i> for data by its customer, which is a contract matter, not a filing "
    "obligation. <b>Do not invent a legal deadline for a small supplier.</b>",
])

story.append(Paragraph("Its structure", S["h2"]))
story.append(table(
    ["Section", "What is in it", "How many"],
    [("<b>Section A</b><br/>General disclosures",
      "Who the company is: name, CIN, locations, employees, turnover, holdings",
      "<b>26</b> data points<br/>(11 grouped rows in your product)"),
     ("<b>Section B</b><br/>Management &amp; process",
      "Your policies: do you have one per principle, is it board-approved, who oversees it",
      "<b>12</b> disclosures"),
     ("<b>Section C</b><br/>Principle-wise performance",
      "The actual numbers, under the nine NGRBC principles",
      "<b>108</b> disclosures")],
    [120, 215, CW - 335]))
story.append(Spacer(1, 8))
story.append(box("The number to know cold", [
    "<b>Section C is where the work is, and it is what your product is built around.</b> Each "
    "disclosure is one of two tiers:",
    "<b>Essential indicators &mdash; 68.</b> Mandatory.&nbsp;&nbsp;&nbsp; "
    "<b>Leadership indicators &mdash; 40.</b> Voluntary, for companies going beyond the minimum.",
    "<b>68 + 40 = 108.</b> That is where your &ldquo;108&rdquo; comes from.",
], tone="good"))

story.append(Paragraph("The nine principles (NGRBC)", S["h2"]))
story.append(table(
    ["", "Principle", "", "Principle"],
    [("<b>P1</b>", "Integrity and ethics", "<b>P6</b>", "<b>Environment</b> &mdash; energy, water, emissions, waste"),
     ("<b>P2</b>", "Sustainable and safe goods and services", "<b>P7</b>", "Responsible public policy advocacy"),
     ("<b>P3</b>", "Employee wellbeing", "<b>P8</b>", "Inclusive growth and equitable development"),
     ("<b>P4</b>", "Stakeholder responsiveness", "<b>P9</b>", "Consumer value"),
     ("<b>P5</b>", "Human rights", "", "")],
    [28, 175, 28, CW - 231]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "<b>P6 is the one that matters most in practice.</b> It holds the emissions and water numbers, it "
    "is the hardest to collect, and it is the part your product maps to CDP, EcoVadis and GRESB.", S["body"]))

story.append(Paragraph("BRSR Core and the assurance timetable", S["h2"]))
story.append(Paragraph(
    "<b>BRSR Core</b> is the <b>subset</b> of BRSR attributes SEBI singled out for independent "
    "checking — <b>nine attributes</b>, with the Industry Standards Forum later publishing detailed "
    "standards covering <b>42 Core KPIs</b> within them.", S["body"]))
story.append(Paragraph(
    "<b>The glide path</b> — who must get BRSR Core checked, and when. SEBI's circular of "
    "<b>12 July 2023</b>, unchanged by the March 2025 amendments:", S["body"]))
story.append(table(
    ["Financial year", "Who"],
    [("<b>FY 2023-24</b>", "Top <b>150</b> listed companies"),
     ("<b>FY 2024-25</b>", "Top <b>250</b>"),
     ("<b>FY 2025-26</b>", "Top <b>500</b>"),
     ("<b>FY 2026-27</b>", "Top <b>1,000</b>")],
    [120, CW - 120]))
story.append(Spacer(1, 8))
story.append(box("The credibility marker", [
    "<b>Value chain disclosure is SEPARATE and is VOLUNTARY</b> — for the top 250 from FY 2025-26.",
    "People constantly confuse it with the assurance glide path above. <b>Do not.</b> Getting this "
    "right in conversation is a genuine marker that you know the regulation.",
], tone="warn"))

# ═══════════════════════════════ PART 4 ═══════════════════════════════
story.append(PageBreak())
story += part("4", "CDP, EcoVadis, GRESB — and how they connect")

story.append(Paragraph("CDP", S["h2"]))
story += bullets([
    "<b>Who:</b> investors and large customers ask you to respond",
    "<b>What:</b> an annual online questionnaire on climate, water and forests",
    "<b>You get:</b> a score from <b>A</b> down to <b>D-</b>. A is &ldquo;Leadership&rdquo;; "
    "D- means you barely engaged",
    "<b>Heavy on:</b> board oversight of climate, risks and opportunities, targets, Scope 1/2/<b>3</b>",
    "<b>Voluntary</b> — but when BlackRock or your biggest customer asks, declining is a decision",
])

story.append(Paragraph("EcoVadis — the most misunderstood one", S["h2"]))
story += bullets([
    "<b>Who:</b> a <b>buyer</b> tells its suppliers <i>&ldquo;get an EcoVadis rating or you cannot "
    "bid.&rdquo;</i> Very common for Indian companies exporting to Europe",
    "<b>What:</b> you upload evidence documents; EcoVadis analysts score you",
    "<b>You get:</b> <b>0&ndash;100</b>, plus a medal — <b>Bronze, Silver, Gold, Platinum</b>",
    "<b>Structure: 4 themes, 21 criteria.</b> Themes are <b>Environment; Labour &amp; Human Rights; "
    "Ethics; Sustainable Procurement</b>",
])
story.append(Spacer(1, 4))
story.append(box("What makes EcoVadis different from everything else", [
    "It rates your <b>management system</b>, not just your numbers. For each criterion it looks for "
    "three things:",
    "<b>1. Policies</b> — do you have a written, approved one?&nbsp;&nbsp; <b>2. Actions</b> — what "
    "did you actually do? Certifications, training, audits?&nbsp;&nbsp; <b>3. Results</b> — the "
    "numbers, with trends.",
    "<b>So a company can have excellent numbers and a mediocre EcoVadis score</b>, because it cannot "
    "evidence the system behind them. <b>Most people do not have this insight. It is worth saying out "
    "loud.</b>",
], tone="info"))

story.append(Paragraph("GRESB", S["h2"]))
story += bullets([
    "<b>Who:</b> investors in <b>real estate and infrastructure</b> funds",
    "<b>Only applies to property and infrastructure.</b> Irrelevant to a textile mill or a pharma "
    "company",
    "<b>You get:</b> a score out of 100 and a rank against peers",
    "<b>Structure:</b> <b>Components</b> made of <b>Aspects</b>, across two separate assessments with "
    "<b>different vocabularies</b>",
])
story.append(Spacer(1, 3))
story.append(table(
    ["Assessment", "Components and Aspects"],
    [("<b>Real Estate</b>",
      "<b>Management</b> (5 aspects: Leadership, Policies, ESG Reporting, Risk Management, Employee "
      "Engagement) · <b>Performance</b> (10 aspects incl. Energy, GHG, Water, Waste, Tenants &amp; "
      "Community, Building Certifications) · <b>Development</b>"),
     ("<b>Infrastructure</b>",
      "<b>Management</b> (6 aspects incl. Targets, Stakeholder Engagement) · <b>Performance</b> "
      "(12 aspects incl. Energy, Greenhouse Gas Emissions, <b>Air Pollution</b>, Water, Waste, "
      "<b>Biodiversity &amp; Habitat</b>, Health &amp; Safety, Employees, Customers)")],
    [96, CW - 96]))

story.append(PageBreak())
story.append(Paragraph("How they all connect", S["h2"]))
story.append(Paragraph(
    "<b>This is your product's reason to exist. They ask for the same underlying facts in different "
    "languages.</b>", S["lead"]))
story.append(Paragraph(
    "Take <b>one number — the electricity your client bought last year, in kWh:</b>", S["body"]))
story.append(table(
    ["Framework", "How it wants that same number"],
    [("<b>BRSR</b>", "Under Principle 6, inside total energy in joules, plus intensity per rupee of turnover"),
     ("<b>CDP</b>", "As the activity data behind your <b>Scope 2</b> emissions"),
     ("<b>EcoVadis</b>", "As a <b>Results</b> metric under <i>Energy consumption &amp; GHGs</i> — plus "
      "the policy and the actions around it"),
     ("<b>GRESB</b>", "<b>Per asset</b>, normalised by floor area, under the <b>Energy</b> aspect")],
    [96, CW - 96]))
story.append(Spacer(1, 10))
story.append(box("The pain, in one paragraph", [
    "<b>One meter reading. Four questionnaires. Four vocabularies. Four deadlines. Four different "
    "people asking the client's facilities manager the same question.</b>",
    "A firm like SAGE, running BRSR <i>alongside</i> CDP, EcoVadis, GRESB and GRI for 65+ clients, is "
    "doing that translation <b>by hand, for every client, every year.</b>",
    "<b>That is the &ldquo;real hours&rdquo; your email promised to save. The problem you named is "
    "real.</b> The only open question is how much of the solution exists — Part 7.",
], tone="good"))

# ═══════════════════════════════ PART 5 ═══════════════════════════════
story.append(PageBreak())
story += part("5", "Who she is, and what SAGE does")

story.append(Paragraph("Dr. Shashi Kad — she/her", S["h2"]))
story += bullets([
    "<b>Founder &amp; Chief Sustainability Strategist, SAGE Sustainability</b>",
    "<b>Geologist</b> by training (Panjab University), <b>PhD in Earth Sciences</b>, "
    "<b>Oxford alumna</b>",
    "~20+ years across <b>India, UK and Japan</b>",
    "<b>Certified in GRI, SBTi, CDP and Integrated Reporting</b> — four of the frameworks above",
    "<b>Curriculum lead and principal trainer of Green Skills Academy</b>, a national "
    "climate-literacy initiative supported by <b>NSDC (National Skill Development Corporation)</b>",
    "Guest faculty at <b>IMT Hyderabad</b> and <b>IIFM Bhopal</b>; mentors women returning to work; "
    "award-winning science communicator",
    "Founded SAGE in <b>2016</b> after a career break, partly to create re-entry paths for women",
    "<b>Address her as Dr. Kad</b> until she says otherwise",
])
story.append(Spacer(1, 4))
story.append(box("Why she matters more than her subscription would", [
    "She <b>trains your exact target customer</b> — ESG consultants — at <b>national scale, with a "
    "government-backed certificate attached.</b> Her curriculum is worth far more to you than her "
    "licence fee.",
], tone="info"))

story.append(Paragraph("SAGE Sustainability", S["h2"]))
story += bullets([
    "<b>B Corp</b>, based in <b>Bengaluru</b>, founded <b>2016</b>",
    "<b>~17 people</b>, <b>100+ projects</b>, <b>65+ clients</b>, 6+ countries",
    "<b>90% of work is repeat or referral</b> (their own figure) — <b>reputation is everything to "
    "them. Anyone who looks like a risk to it gets politely declined.</b>",
    "Uses <b>Doughnut Economics</b> as its strategy lens",
    "Works across <b>BRSR, CDP, EcoVadis, GRESB, GRI, SBTi, Integrated Reporting, B Corp</b>",
    "Clients include <b>Hero MotoCorp, Mu Sigma, Brigade Group, re-wrap UK, NC John Garments</b>",
])
story.append(Spacer(1, 4))
story.append(box("Their signature method — learn this phrase", [
    "<b>&ldquo;Guided traverse &raquo; independent traverse.&rdquo;</b>",
    "They co-create heavily up front, then <b>deliberately hand the disclosure cycle to the client</b> "
    "and review from the background. The goal is for the client to stand on their own.",
    "<b>Why this is gold for you:</b> your Collect product <b>is a handover mechanism.</b> It lets a "
    "client's own team enter the data while the consultant supervises. <b>Use her words, not "
    "yours</b> — say &ldquo;guided traverse to independent traverse&rdquo; and she will see the fit "
    "faster than any demo.",
], tone="good"))

# ═══════════════════════════════ PART 6 ═══════════════════════════════
story.append(PageBreak())
story += part("6", "The email problem",
              "And the one thing to do before the call.")
story.append(Paragraph(
    "Your agent wrote and sent the emails. Email 1 (28 September) said:", S["body"]))
story.append(Paragraph(
    "&ldquo;I read your piece on the balance between regulatory disclosure and voluntary leadership. "
    "Your point that companies should tell their whole story, not just the required part, stayed with "
    "me.&rdquo;", S["quote"]))
story.append(Paragraph(
    "<b>You have not read it.</b> She replied partly <i>because</i> of that opening — "
    "<i>&ldquo;Thanks for your note and for reading my piece.&rdquo;</i>", S["body"]))

story.append(box("This is the highest-priority item in the whole document", [
    "<b>Go and read her article before the call.</b> Find it on her LinkedIn or SAGE's site. Ten "
    "minutes.",
    "She may ask <i>&ldquo;what resonated with you?&rdquo;</i> or reference her own argument in "
    "passing. <b>A vague answer there is the one thing that would make her doubt everything else you "
    "say — including the honest parts.</b> And there is no script that substitutes for having read "
    "800 words.",
    "<b>When you read it, write down two things:</b> one sentence you agreed with, and <b>one thing "
    "you would push back on or want to ask about.</b> The second is worth more. Someone who only "
    "agrees is flattering; someone with a real question is interesting.",
], tone="warn"))

story.append(Paragraph("The thesis, from her own words and your email", S["h2"]))
story.append(Paragraph(
    "Mandatory disclosure is a floor, not a ceiling; a company that reports only what the regulator "
    "demands tells an incomplete story; and <b>voluntary disclosure works because it is &ldquo;led by "
    "ambition, not compliance.&rdquo;</b>", S["body"]))
story.append(Spacer(1, 4))
story.append(box("Do not quote her line twice", [
    "That quoted line — <b>&ldquo;led by ambition, not compliance&rdquo;</b> — is hers, and your "
    "second email <b>already quoted it back to her.</b> Do <b>NOT</b> quote it again on the call. "
    "Once is good. Twice is flattery. <b>Let her say it.</b>",
], tone="warn"))

# ═══════════════════════════════ PART 7 ═══════════════════════════════
story.append(PageBreak())
story += part("7", "What you have actually built",
              "Three things. Learn them in this order — it is the order of how finished they are.")

story.append(Paragraph("1. The free readiness check — finished, live, no login", S["h2"]))
story.append(Paragraph(
    "A consultant answers seven questions about a client (industry, size, listed or not, export "
    "markets, what filings they already make). The tool goes through <b>all 108 BRSR Section C "
    "disclosures</b> and sorts each into:", S["body"]))
story.append(table(
    ["Status", "Meaning"],
    [("<b>Ready to pull</b>", "The client already produces this for some other filing"),
     ("<b>Needs verification</b>", "Partly there, one piece missing"),
     ("<b>Collect fresh</b>", "Nothing exists, start from zero"),
     ("<i>Not applicable</i>", "Manufacturing-only disclosures, hidden for service companies")],
    [120, CW - 120]))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Open any row and you get: the <b>exact SEBI wording</b>, the <b>ICAI page number</b>, where "
    "inside the company that data usually lives, what a complete answer contains, India and "
    "international best practice, and — for emissions — the <b>emission factor with its version and "
    "financial year</b>. You can also upload last year's report as a PDF and it detects which "
    "disclosures were already covered — <b>and the file never leaves the browser.</b>", S["body"]))
story.append(Spacer(1, 2))
story.append(box("The line to say", [
    "<b>&ldquo;The value isn't the list of 108. It's knowing which third you don't have to "
    "chase.&rdquo;</b>",
], tone="good"))

story.append(Paragraph("2. Collect — built and working, but untested outside", S["h2"]))
story.append(Paragraph(
    "The workspace for the chasing itself. You pick which BRSR fields belong to which person inside "
    "the client — electricity to facilities, headcount to HR — and each person gets <b>their own link "
    "with no login</b>, showing only their fields. They type their numbers and attach the bill or "
    "invoice. It <b>chases them automatically</b> on a schedule. Emissions compute from cited factors. "
    "Every figure records <b>who it came from</b> and <b>whether a person typed it or a document was "
    "read for it.</b> Then it produces a printable draft. <b>138 fields are requestable</b> — all of "
    "Sections A, B and C.", S["body"]))
story.append(box("Say this out loud — it makes everything else believable", [
    "<b>Nine collections exist. All created in a two-week window in June. All by you, testing. "
    "No outside practice has ever run a real client through it.</b>",
], tone="warn"))

story.append(Paragraph("3. The crosswalk — the part your email was about", S["h2"]))
story.append(Paragraph(
    "A reference table. For each BRSR disclosure it tells you <b>which item in each other framework "
    "asks for the same thing</b>: <b>GRI, TCFD, IFRS S1/S2, TNFD, ESRS, CDP, EcoVadis — and "
    "GRESB</b>.", S["body"]))
story += bullets([
    "<b>CDP and EcoVadis:</b> mapped at <b>field level for Principle 6 only</b> (26 rows). Other "
    "principles are principle-level only.",
    "<b>GRESB:</b> <b>40 of 77 rows</b>, mapped <b>separately for the Real Estate and Infrastructure "
    "Assessments</b> because their vocabularies differ. <b>A third of BRSR maps nowhere in GRESB</b> — "
    "no human-rights aspect, no statutory-CSR aspect — so those rows are deliberately empty.",
])

story.append(Paragraph("Plus nine free tools", S["h2"]))
story.append(Paragraph(
    "A BRSR applicability checker, a GHG calculator, a Scope 3 calculator, an audit-readiness evidence "
    "checklist, an XBRL pre-flight check, a materiality starter, a P3 wellbeing schedule builder, a "
    "PPP-adjusted intensity calculator, and a <b>published database of every emission factor the "
    "product uses, with its citation and version.</b> Plus reference pages for all 108 disclosures, a "
    "50-term glossary, and an eight-module teaching pack.", S["body"]))

story.append(PageBreak())
story.append(Paragraph("The one thing in your email that was not true", S["h2"]))
story.append(Paragraph("Your second email said:", S["body"]))
story.append(Paragraph(
    "&ldquo;<b>Next I am building</b> a shared workspace where a client collects each number once "
    "(energy, water, people) and it maps across BRSR, CDP, EcoVadis and GRESB, instead of being "
    "chased separately for every framework.&rdquo;", S["quote"]))
story.append(table(
    ["Half of the claim", "Reality"],
    [("&ldquo;a shared workspace where a client collects each number once&rdquo;",
      "<b>TRUE.</b> That is Collect."),
     ("&ldquo;and it maps across BRSR, CDP, EcoVadis and GRESB&rdquo;",
      "<b>The knowledge existed. The plumbing did not. Now BUILT</b> for environment (Principle 6) "
      "and people (Principle 3 + the Section A employee rows) &mdash; the three things your email named.")],
    [245, CW - 245]))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "<b>In plain terms:</b> the crosswalk could tell you <i>which CDP question your client's energy "
    "number answers.</i> It could not take the number your client typed into Collect and <b>put it "
    "into a CDP answer</b>. The map was drawn; the pipe was not built.", S["body"]))
story.append(Paragraph(
    "<b>That is now built for the three things your email named.</b> A figure submitted by the "
    "client's team is shown alongside its GRI standard, TCFD pillar, IFRS reference, CDP "
    "questionnaire area, EcoVadis criterion and GRESB aspect.", S["body"]))
story.append(table(
    ["What the email named", "Status"],
    [("<b>Energy</b><br/>Principle 6",
      "<b>BUILT.</b> Electricity, fuel, renewables, total energy and intensity"),
     ("<b>Water</b><br/>Principle 6",
      "<b>BUILT.</b> Withdrawal, consumption, discharge, Zero Liquid Discharge"),
     ("<b>People</b><br/>Principle 3 + Section A",
      "<b>BUILT.</b> Headcount and turnover (from Section A, where BRSR actually asks for them), plus "
      "training, safety incidents, benefits, unions, complaints and return-to-work"),
     ("<i>Also built, in P6</i>",
      "Emissions (Scope 1, 2 and 3), waste, air pollution, biodiversity")],
    [128, CW - 128]))
story.append(Spacer(1, 7))
story.append(Paragraph(
    "<b>What is still NOT carried across:</b> ethics (P1), products (P2), stakeholders (P4), human "
    "rights (P5), advocacy (P7), community (P8) and consumers (P9). Those have the crosswalk as "
    "reference, but a collected value does not flow into it yet. <b>The screen says so, so you cannot "
    "overclaim it by accident.</b>", S["body"]))
story.append(Spacer(1, 4))
story.append(box("The sentence to say, close to verbatim", [
    "&ldquo;The workspace collects each number once, and that number now carries across &mdash; for "
    "energy, water and people, which are the three things I named in my email. A figure your team "
    "submits shows up with its GRI standard, its CDP questionnaire area, the EcoVadis criterion it "
    "evidences and the GRESB aspect. Ethics, human rights, community and consumers have the crosswalk "
    "but not the pipe yet. That's the next build.&rdquo;",
    "<b>Your email said &ldquo;Next I am building.&rdquo; Future tense. You are not caught out.</b>",
], tone="good"))

# ═══════════════════════════════ PART 8 ═══════════════════════════════
story.append(PageBreak())
story += part("8", "Things you must never say")
story.append(table(
    ["Do not say", "Why"],
    [("<b>&ldquo;Seats&rdquo;</b>",
      "Per-person accounts do not exist. SAGE's 17 people would share <b>one passcode</b>."),
     ("<b>Any price, range, or &ldquo;around X&rdquo;</b>",
      "Nothing validated. Say: <i>&ldquo;priced per engagement, onboarded manually.&rdquo;</i>"),
     ("<b>&ldquo;Only&rdquo; or &ldquo;first&rdquo;</b>",
      "FileBRSR, SustainableX and RSustain all overlap with you."),
     ("<b>A competitor's price</b>", "You have not verified any of them yourself."),
     ("<b>&ldquo;Nothing leaves your browser&rdquo; about Collect</b>",
      "True of the <b>free tool only</b>. The AI importer and narrative drafter send extracted "
      "<b>text</b> to an AI provider — the <i>file</i> stays local, the text does not."),
     ("<b>That Collect is &ldquo;validated&rdquo;</b>",
      "A consultant named <b>Priya Ranjan</b> shaped it. <b>No outside practice has run it.</b> "
      "Different claims."),
     ("<b>&ldquo;16 owners, 7 responded, 44%&rdquo;</b>",
      "Those were almost certainly your own test contacts. <b>With her, this is the claim that costs "
      "everything if it surfaces later.</b>"),
     ("<b>The homepage sample company as a customer</b>", "It is fictional."),
     ("<b>Any other consultancy, or the other firms you emailed</b>",
      "She runs a referral practice. Discretion is the signal."),
     ("<b>An acronym you are not sure of</b>", "<b>Never invent an expansion.</b>")],
    [185, CW - 185]))
story.append(Spacer(1, 8))
story.append(box("Traction, if asked", [
    "<b>&ldquo;More than 220 users, mostly independent consultants. No firm is a customer yet.&rdquo;</b>",
], tone="info"))

# ═══════════════════════════════ PART 9 ═══════════════════════════════
story.append(PageBreak())
story += part("9", "The call itself")

story.append(Paragraph("What you are pitching: a test, not the product", S["h2"]))
story.append(Paragraph(
    "<b>&ldquo;I want to run one of your live BRSR engagements through this, free, so I can find out "
    "where it breaks.&rdquo;</b>", S["lead"]))
story.append(Paragraph(
    "That is the whole pitch. You are not selling. You are not quoting a price. <b>And you are not "
    "asking for a job</b> — that converts the thing you own into labour and turns you from a "
    "founder-peer into an applicant.", S["body"]))

story.append(Paragraph("How to be: four rules", S["h2"]))
story += bullets([
    "<b>Concede first.</b> Every claim arrives with its own limitation attached.",
    "<b>Let her correct you.</b> The call succeeds <b>if she talks more than you.</b> When she "
    "criticises something, say <i>&ldquo;say more about that&rdquo;</i> or <i>&ldquo;where have you "
    "seen that go wrong?&rdquo;</i> — <b>never &ldquo;yes, but&rdquo;</b> and <b>never "
    "&ldquo;that's actually already handled.&rdquo;</b>",
    "<b>Use her language</b> — &ldquo;guided traverse to independent traverse.&rdquo;",
    "<b>Never lead with the ask.</b> Ask where SAGE loses hours first.",
])
story.append(Paragraph(
    "<b>Energy: calm, specific, curious — not eager.</b> She has no shortage of work.", S["body"]))

story.append(Paragraph("Before the call", S["h2"]))
story += bullets([
    "Open <b>saaksh.co</b> in a clean browser window. Visit <b>/notrack</b> once to kill the cookie "
    "banner",
    "<b>Generate the report BEFORE you share your screen:</b> go to <b>/start</b>, company name "
    "<b>&ldquo;Anonymised &mdash; mid-size textile exporter&rdquo;</b>, Industry <b>Textile &amp; "
    "Apparel</b>, Business type <b>Product/Manufacturing</b>, Size <b>Listed top 1000</b>, Maturity "
    "<b>First-time filing</b> then submit. Leave it open",
    "<b>Check the homepage calculator says 0.710 and CEA v21.0, FY 2024-25.</b> If it says 0.716 or "
    "v18, <b>do not open the homepage calculator on screen-share</b> — a stale emission factor is the "
    "one error she is most qualified to spot",
    "<b>Read her article.</b> Write down one agreement and one question",
    "Phone on silent. Notebook and pen — <b>visible note-taking is a signal</b>",
])

story.append(PageBreak())
story.append(Paragraph("The opening — rehearse this aloud three times", S["h2"]))
story.append(Paragraph(
    "&ldquo;Thanks for making the time.<br/><br/>"
    "Before I show you anything &mdash; one thing from my email I want to be precise about. I said the "
    "workspace maps across BRSR, CDP, EcoVadis and GRESB. The field-level mapping is real for "
    "Principle 6 against CDP and EcoVadis, I built the GRESB crosswalk this week, and the collected "
    "figure now actually carries across &mdash; for energy, water and people, which are the three "
    "things I named. Ethics, human rights, community and consumers have the crosswalk but not the "
    "pipe yet.<br/><br/>"
    "And the honest state of the rest: about two hundred and forty consultants have used the free tool "
    "over five months, and almost none have come back. I think I know why &mdash; a gap analysis is a "
    "once-a-year job per client. The part that actually recurs, chasing the numbers out of a client's "
    "team, is the part I've built and that nobody outside has really run yet.<br/><br/>"
    "So I'm not here to tell you it works. I'd like to find out whether I'm right, on something real. "
    "Can I show you the first pass, and then mostly be corrected?&rdquo;", S["quote"]))
story.append(box("Two numbers, one phrase", [
    "<b>Do not fumble: about 240, and once a year.</b>",
    "<b>Do not soften: &ldquo;almost none have come back.&rdquo;</b> If it lands apologetic it reads "
    "as weakness; said plainly it reads as candour — <b>and candour is what got you this meeting.</b>",
], tone="warn"))

story.append(Paragraph("The demo — eight minutes, in this order", S["h2"]))
story.append(table(
    ["", "What", "What to say"],
    [("<b>a</b>", "<b>The three statuses</b><br/>60 seconds",
      "&ldquo;It's gone through all 108 Section C disclosures and sorted them into what they can pull "
      "from filings they already make, what's partly there, and what they have to collect fresh. "
      "The value isn't the list &mdash; it's knowing which third you don't have to chase.&rdquo;"),
     ("<b>b</b>", "<b>One Principle 6 row, expanded</b><br/>3 minutes<br/><br/><i>The most important "
      "minute of the call</i>",
      "&ldquo;Here's what's under one row. The SEBI wording, verbatim. The ICAI page it's on. Where "
      "the data usually lives. And the emission factor, with its version and the year it applies to. "
      "That last one is why the product exists &mdash; a Scope 2 number computed on last year's grid "
      "factor still adds up. It's just computed on a basis nobody can cite now.&rdquo;<br/><br/>"
      "<b>Then pause.</b> This is where she will engage — citation discipline is her native language."),
     ("<b>c</b>", "<b>Where it deliberately stops</b><br/>90 seconds<br/><br/><i>Do not skip this</i>",
      "&ldquo;Three things it won't do. It doesn't decide materiality &mdash; that needs a stakeholder "
      "process, and the tool says so on its own screen. It doesn't claim anything is assured; it's "
      "built so a figure can be defended &mdash; source, owner, evidence, factor version &mdash; which "
      "is a different thing. And it doesn't pretend the wider sustainability story is finished just "
      "because the disclosures are.&rdquo;<br/><br/><b>That last sentence is your first email's thesis, "
      "demonstrated instead of asserted.</b>"),
     ("<b>d</b>", "<b>Collect, in her language</b><br/>3&ndash;4 minutes<br/><br/><i>She booked on "
      "this &mdash; give it the time</i>",
      "&ldquo;You assign the fields to the people inside the client who actually hold them. They get "
      "their own link, no login, and fill in their own numbers. It chases them. And every figure comes "
      "back with who it came from, and whether a person typed it or a document was read for it. "
      "The reason I think it might fit SAGE: it's a handover mechanism. Your guided-to-independent "
      "traverse &mdash; that's the shape I've been building without having a name for it.&rdquo;")],
    [20, 118, CW - 138]))
story.append(Spacer(1, 6))
story.append(box("Demo guard rails", [
    "<b>Skip materiality and the framework crosswalk unless she asks.</b>",
    "<b>Never show</b> Collect with real campaigns in it, the fee builder, or any screen you have not "
    "clicked that morning.",
    "Then stop: <i>&ldquo;That's the tour. Where does the first pass get that balance wrong &mdash; "
    "between the required part and the fuller story a company should be telling?&rdquo;</i>",
], tone="warn"))

story.append(PageBreak())
story.append(Paragraph("Your four questions — then shut up and write", S["h2"]))
story.append(Paragraph(
    "<b>You asked two of these in writing already and she never answered them.</b> Open with: "
    "<i>&ldquo;I asked you two things in that email and then we sensibly went to scheduling instead. "
    "Can I actually get them?&rdquo;</i>", S["body"]))
story.append(table(
    ["", "Question", "Why"],
    [("<b>Q1</b>",
      "&ldquo;Where does the first pass get that balance wrong &mdash; between the required part and "
      "the fuller story?&rdquo;",
      "The question you promised in writing. <b>Say the second half.</b> &ldquo;That balance&rdquo; "
      "alone is the vague version; the referent is from her own article."),
     ("<b>Q2</b>",
      "&ldquo;Where does SAGE collect the same number twice? Across BRSR, CDP, EcoVadis &mdash; where "
      "is a client giving you the same figure in two different shapes?&rdquo;",
      "<b>The requirements document for your entire roadmap.</b> If you get one good answer all call, "
      "make it this one.<br/><br/>Follow with: <i>&ldquo;Walk me through the last metric that was "
      "genuinely difficult. Where was the source, what was wrong with it, how many rounds, who signed "
      "off?&rdquo;</i> <b>Write that answer down verbatim.</b>"),
     ("<b>Q3</b>",
      "&ldquo;Could these disclosure guides work as learning material for Green Skills Academy?&rdquo;",
      "<b>The biggest long-term prize.</b> Offer it as a gift, not a pitch: <i>&ldquo;I built this for "
      "trainers generally; I'd like your view on whether it's any use to you.&rdquo;</i>"),
     ("<b>Q4</b>",
      "&ldquo;What would SAGE have to stop doing to use something like this?&rdquo;",
      "Separates polite interest from real intent. <b>Drop Q3 before you drop Q4</b> if short on time.")],
    [26, 165, CW - 191]))

story.append(Paragraph("The ask — last two minutes", S["h2"]))
story.append(Paragraph(
    "<b>Pick ONE based on what she responded to. Do not read the list out.</b>", S["body"]))
story.append(table(
    ["If she...", "Say"],
    [("described manual, repeated, spreadsheet work",
      "&ldquo;Is there one client where SAGE is chasing BRSR data right now? I'll set the collection "
      "up myself, free. You keep the relationship and the output &mdash; I get to watch where it "
      "breaks.&rdquo;"),
     ("lit up on training and curriculum",
      "&ldquo;Could we try one co-branded Academy module? I'd build it, your name on it, no cost "
      "either way.&rdquo;"),
     ("named one client's data problem",
      "&ldquo;Could I set up that one collection and show you what comes back?&rdquo;"),
     ("was warm but vague",
      "&ldquo;Could I send you the next version when the thing you flagged is fixed, and get ten more "
      "minutes?&rdquo;")],
    [170, CW - 170]))
story.append(Spacer(1, 8))
story.append(box("If she asks whether you want a job", [
    "&ldquo;I'm not looking for a role &mdash; I'd rather build. If SAGE ever wanted something built "
    "to your spec, that's a conversation I'd love to have. But today I just want one engagement to "
    "test against.&rdquo;",
    "<b>Win condition: a real critique, and yes to one small next step.</b> That is the whole bar.",
], tone="info"))

story.append(PageBreak())
story.append(Paragraph("If she asks — prepared answers", S["h2"]))
story.append(table(
    ["Question", "Answer"],
    [("<b>How is one client's data separated from another's?</b>",
      "&ldquo;Firm-level separation on collections is in &mdash; each firm owns its campaigns and every "
      "campaign query filters by it. Row-level hardening on individual field writes is the next commit. "
      "I'd rather tell you precisely where the line is than say 'it's secure'.&rdquo;"),
     ("<b>Do you have per-user accounts?</b>",
      "&ldquo;No. One passcode per firm today. Real per-person accounts with attribution are the next "
      "build.&rdquo;"),
     ("<b>Does it map to CDP and EcoVadis?</b>",
      "&ldquo;At field level for Principle 6 &mdash; the environment figures clients get asked for "
      "repeatedly. Other principles are principle-level only. And nothing's invented: the vocabulary "
      "comes from the published CDP questionnaire areas and EcoVadis' documented criteria.&rdquo;"),
     ("<b>Is the data assured?</b>",
      "&ldquo;No, and it never claims to be. It's built so a figure can be defended &mdash; source, "
      "owner, evidence, factor version. That's a different thing from assured.&rdquo;"),
     ("<b>Who else uses it?</b>",
      "&ldquo;More than 220 users, mostly independent consultants. No firm is a customer. SAGE would be "
      "the first &mdash; which is exactly why a pilot is worth more to me than a licence fee.&rdquo;"),
     ("<b>Did you build it alone?</b>",
      "&ldquo;I built it with a practising ESG consultant, Priya Ranjan. She shaped what it collects and "
      "in what order.&rdquo;"),
     ("<b>What does it cost?</b>",
      "&ldquo;No public pricing and I haven't validated any. Priced per engagement, onboarded manually. "
      "I'd rather set a price after someone has run a full cycle than guess.&rdquo;"),
     ("<b>We're happy with spreadsheets.</b>",
      "&ldquo;Useful to know &mdash; spreadsheets are what most of my users compare against too. My "
      "question's narrower: not whether you'd replace anything, but whether the chasing part costs you "
      "hours you'd rather not spend.&rdquo;")],
    [152, CW - 152]))

story.append(Spacer(1, 10))
story.append(box("When you don't know — and you will not know several things", [
    "<b>&ldquo;I don't know. Let me check and put it in the note I send today.&rdquo;</b>",
    "<b>&ldquo;I don't know that well enough to answer usefully &mdash; that's the kind of thing I was "
    "hoping to learn from you.&rdquo;</b>",
    "<b>&ldquo;I know the shape of it but not the detail, and I'd rather not guess at a regulatory fact "
    "in front of you.&rdquo;</b>",
    "<b>And this line is legitimately strong &mdash; use it if you feel out of your depth:</b> "
    "&ldquo;You've worked across all four of these for ten years. I've built a tool that assumes "
    "things about how they overlap. I'd mostly like to find out which of my assumptions are wrong.&rdquo;",
    "<b>Never guess a number, a deadline, a threshold or an acronym.</b> She is certified in four "
    "frameworks. <b>&ldquo;I don't know&rdquo; costs you nothing; a confident wrong answer costs the "
    "relationship.</b> And she trains practitioners for a living — not knowing is a position she sees "
    "every day and respects.",
], tone="warn"))

story.append(PageBreak())
story.append(Paragraph("If it goes sideways", S["h2"]))
story.append(table(
    ["Situation", "What to do"],
    [("<b>Cut short</b>", "Demo in 3 minutes, Q1 and Q2 only, then the ask. <b>Protect the ask.</b>"),
     ("<b>She brings a colleague</b>",
      "Good sign. Aim &ldquo;where does it get the balance wrong&rdquo; at whoever does the hands-on "
      "work."),
     ("<b>She finds a real error on screen</b>",
      "&ldquo;That's wrong. Thank you &mdash; I'll fix it today and tell you when it's out.&rdquo; "
      "<b>Then actually do it.</b> A found-and-fixed error in 24 hours demonstrates more than a clean "
      "demo."),
     ("<b>It drifts into general ESG talk</b>",
      "Let it, rapport is the point. But protect the last three minutes.")],
    [160, CW - 160]))

story.append(Paragraph("The same-day note", S["h2"]))
story.append(Paragraph(
    "<b>One thing only.</b> No attachments she did not ask for, no re-pitch.", S["body"]))
story.append(Paragraph(
    "Subject: <b>The one thing &mdash; and thank you</b><br/><br/>"
    "Dr. Kad,<br/><br/>"
    "Thank you for the time, and for the critique. The thing I'm taking away: "
    "[<b>one sentence, in her words, the sharpest thing she said</b>].<br/><br/>"
    "As agreed: [<b>the one next step, with a date</b>].<br/><br/>"
    "[<b>If she found an error:</b> You were right about [X]. It's fixed and live as of today.]<br/><br/>"
    "Nothing else from me until then.<br/><br/>Rahul", S["quote"]))
story.append(box("", [
    "<b>Resist adding a second ask. The restraint is the message.</b>",
], tone="warn"))

# ═══════════════════════════════ PART 10 ═══════════════════════════════
story.append(PageBreak())
story += part("10", "The fifteen things to recall",
              "If you remember nothing else.")

recall = [
    "<b>This field exists to turn &ldquo;we care about the environment&rdquo; into numbers somebody can "
    "check.</b> That is also what Saaksh is for.",
    "<b>ESG = Environmental, Social, Governance.</b>",
    "<b>Four audiences demand this data:</b> regulators (BRSR, CSRD), investors (CDP, TCFD, IFRS, "
    "GRESB), buyers (EcoVadis), the public (GRI).",
    "<b>BRSR = Business Responsibility and Sustainability Report.</b> SEBI-mandated, top 1,000 listed "
    "Indian companies, since FY 2022-23.",
    "<b>108 Section C disclosures = 68 Essential + 40 Leadership.</b> Nine principles. "
    "<b>P6 is environment and matters most.</b>",
    "<b>BRSR Core</b> is the assured subset &mdash; <b>9 attributes, 42 KPIs.</b> Glide path: "
    "<b>150 &raquo; 250 &raquo; 500 &raquo; 1,000</b> across FY23-24 to FY26-27. "
    "<b>Value chain disclosure is separate and voluntary.</b>",
    "<b>Scope 1 = what you burn. Scope 2 = the electricity you buy. Scope 3 = your value chain.</b> "
    "BRSR requires 1 and 2; Scope 3 is voluntary.",
    "<b>Never expand CDP, EcoVadis or GRESB.</b> CDP dropped its full name in 2013; EcoVadis is not an "
    "acronym; GRESB's old full form is now wrong.",
    "<b>EcoVadis rates your management system</b> &mdash; policy, actions, results &mdash; not just "
    "numbers. Four themes, 21 criteria, medals.",
    "<b>One meter reading answers a question in all four frameworks, in four vocabularies.</b> That is "
    "the pain, and the reason the product exists.",
    "<b>SAGE: B Corp, Bengaluru, 2016, ~17 people, 65+ clients, 90% repeat or referral.</b> Their "
    "method is <b>&ldquo;guided traverse &raquo; independent traverse&rdquo;</b> &mdash; and "
    "<b>Collect is a handover mechanism.</b>",
    "<b>She has a PhD in Earth Sciences and is certified in GRI, SBTi, CDP and Integrated "
    "Reporting.</b> She leads <b>Green Skills Academy</b>, backed by <b>NSDC</b>.",
    "<b>&ldquo;Collects each number once&rdquo; is TRUE</b>, and it now <b>carries across for energy, "
    "water and people</b> &mdash; the three things your email named. Ethics, products, stakeholders, "
    "human rights, advocacy, community and consumers have the crosswalk but not the pipe.",
    "<b>Nine collections, all yours, all from June. No outside practice has run it.</b> Say it.",
    "<b>Read her article before the call.</b> Ten minutes. Write down one agreement and one question. "
    "Nothing in this document substitutes for it.",
]
rows = [(f"<b>{i+1}</b>", r) for i, r in enumerate(recall)]
story.append(table(["", "The thing"], rows, [26, CW - 26]))

story.append(Spacer(1, 14))
story.append(box("And the thing to hold on to", [
    "<b>The aim is not to pass an exam on four frameworks.</b> It is to show one honest thing, hear "
    "where it's wrong, and ask for one engagement to test it on.",
    "<b>She knows this field better than you ever will &mdash; that is exactly why you want her, and "
    "saying so out loud is a strength, not a weakness.</b>",
], tone="good"))

# ───────────────────────── build ─────────────────────────
doc = Doc(OUT)
# first page uses the cover template, then switch
story.insert(0, Spacer(0, 0))


class SwitchToBody(Flowable):
    def wrap(self, aw, ah):
        return (0, 0)

    def draw(self):
        pass


doc.build(story, onFirstPage=None) if False else None

# Build with explicit template switching: cover page first, body thereafter.
from reportlab.platypus.doctemplate import NextPageTemplate
story2 = [NextPageTemplate("body")] + story
doc = Doc(OUT)
doc.build(story2)
print("WROTE", OUT)
