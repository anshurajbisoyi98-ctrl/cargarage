# UI Structure Guide

## Page Layout Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ ┌─────────┐  ┌──────────────────────────────────────┐ │
│ │ Ford    │  │ Navigation                           │ │
│ │  ━━━━   │  │ [My garage] [Story] [Details] [Menu] │ │
│ └─────────┘  └──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 HERO SECTION                            │
│                 ┌──────────────┐                        │
│                 │  MUSTANG     │                        │
│                 │  FASTBACK®   │                        │
│                 └──────────────┘                        │
│                                                         │
│                 [Car Image Scene]                       │
│                                                         │
│                 [Hotspots + View Label]                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ BOTTOM CONTROLS                                         │
│ [Scene Info] [Reveal Slider] [Description]              │
├─────────────────────────────────────────────────────────┤
│ FOOTER                                                  │
│ [Share] [Scene Chapters: 01 02 03] [Legacy Note]        │
└─────────────────────────────────────────────────────────┘
```

## Service Dialog Structure

```
┌─────────────────────────────────────────────────────────┐
│ SERVICE DIALOG                                    [✕]   │
├─────────────────────────────────────────────────────────┤
│ MUSTANG / OWNER SERVICES                                │
│                                                         │
│ ┌─────────────────────┐  ┌──────────────────────────┐  │
│ │ Your garage.        │  │ John Doe                 │  │
│ │                     │  │ [Sign out ↗]             │  │
│ └─────────────────────┘  └──────────────────────────┘  │
│                                                         │
│ [Message Area]                                          │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [OVERVIEW] [MY VEHICLES] [REQUESTS] [HISTORY]       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CONTENT AREA (Changes based on selected tab)        │ │
│ │                                                     │ │
│ │ • Overview: Dashboard stats + upcoming services    │ │
│ │ • My Vehicles: Vehicle cards in 2-column grid      │ │
│ │ • Requests: Service booking list                   │ │
│ │ • History: Completed services list                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Navigation Flow

```
Main Page
    │
    ├─→ [My garage] ────→ Service Dialog
    │                         │
    │                         ├─→ OVERVIEW Tab
    │                         │     ├─ Dashboard Stats
    │                         │     ├─ Upcoming Services
    │                         │     └─ [Book Service]
    │                         │
    │                         ├─→ MY VEHICLES Tab
    │                         │     ├─ Vehicle Grid
    │                         │     ├─ [Add Vehicle]
    │                         │     └─ Vehicle Actions:
    │                         │           ├─ [Edit]
    │                         │           ├─ [History & Reminder]
    │                         │           └─ [Delete]
    │                         │
    │                         ├─→ REQUESTS Tab
    │                         │     ├─ Booking List
    │                         │     ├─ [Book Service]
    │                         │     └─ Staff Actions:
    │                         │           ├─ [Accept]
    │                         │           ├─ [Reject]
    │                         │           └─ [Complete]
    │                         │
    │                         └─→ HISTORY Tab
    │                               └─ Completed Services List
    │
    ├─→ [The story] ────→ Story Dialog
    │
    ├─→ [Explore] ──────→ Details Scene
    │
    └─→ [Menu] ─────────→ Menu Dialog
                             └─→ [My garage] (same as header)
```

## Component Breakdown

### Header Components
```
Ford Logo (clickable - returns to scene 1)
Brand Note (tagline)
Navigation Buttons:
  • My garage ↗
  • The story ↗
  • Explore the icon ↗
Menu Button (☰)
```

### Hero Components
```
Eyebrow (Heritage Collection label)
Headline (MUSTANG FASTBACK®)
Caption (tagline)
Year Mark (68)
View Label (STUDIO 01 - THE ORIGINAL)
```

### Scene Components
```
Image Layers:
  • Revealed (base layer, always visible)
  • Covered (reveal state 0%)
  • Billow (reveal state ~50%)
  • Detail (scene 3)

Hotspots (scene 1 only):
  • Body hotspot
  • Wheel hotspot
```

### Bottom Controls
```
Section Index (01 / 03)
Scene Description
  • Title
  • Description text
  • [Discover story] button

Reveal Control:
  • Label + Progress (100%)
  • Range slider (0-100)
  • [Replay] button
  • Drag instruction
```

### Footer Components
```
Share Button
Chapter Navigation (01 02 03)
Legacy Note (© 1968 — FOREVER)
```

## Service Dialog Tabs

### OVERVIEW Tab Structure
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Stats (3-column grid)                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐ │
│ │ YOUR     │ │ COMPLETED│ │ TOTAL SERVICE COST       │ │
│ │ VEHICLES │ │ SERVICES │ │                          │ │
│ │    2     │ │    5     │ │    ₹15,000               │ │
│ └──────────┘ └──────────┘ └──────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Upcoming services                    [Book a service ↗] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [pending] Mustang TEST-123                          │ │
│ │ Brake service                                       │ │
│ │ 15 Jan, 2026                                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### MY VEHICLES Tab Structure
```
┌─────────────────────────────────────────────────────────┐
│ Your collection                      [Register vehicle +]│
│                                                         │
│ ┌────────────────────┐  ┌────────────────────┐         │
│ │ TEST-123           │  │ TEST-456           │         │
│ │ Mustang Fastback   │  │ Ford Mustang       │         │
│ │ 45,000 km          │  │ 32,000 km          │         │
│ │ Purchased 1 Jan... │  │ Purchased 5 May... │         │
│ │                    │  │                    │         │
│ │ [Edit] [History]   │  │ [Edit] [History]   │         │
│ │ [Delete]           │  │ [Delete]           │         │
│ └────────────────────┘  └────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### REQUESTS Tab Structure (Owner View)
```
┌─────────────────────────────────────────────────────────┐
│ Your service bookings                 [Book a service +] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [pending] Mustang TEST-123                          │ │
│ │ Oil change and inspection                           │ │
│ │ 20 Sep, 2026                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [accepted] Mustang TEST-456                         │ │
│ │ Brake service                                       │ │
│ │ 25 Sep, 2026                                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### REQUESTS Tab Structure (Staff View)
```
┌─────────────────────────────────────────────────────────┐
│ All requests                          [Book a service +] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [pending] Mustang TEST-123                          │ │
│ │ Oil change and inspection                           │ │
│ │ 20 Sep, 2026 · John Doe                            │ │
│ │                          [Accept ↗] [Reject]        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [accepted] Mustang TEST-456                         │ │
│ │ Brake service                                       │ │
│ │ 25 Sep, 2026 · Jane Smith                          │ │
│ │                          [Log completed work ↗]     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### HISTORY Tab Structure
```
┌─────────────────────────────────────────────────────────┐
│ Completed services                                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 15 Aug, 2026 · 42,000 KM                           │ │
│ │ Mustang Fastback                                   │ │
│ │ Oil change completed                               │ │
│ │                                                    │ │
│ │ Oil filter — ₹450                                  │ │
│ │ Engine oil — ₹2,400                                │ │
│ │ Labor — ₹1,500                            ₹4,350   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme

### Main Colors
```
Background:     #11120f (near black)
Text Primary:   #eeeee7 (ivory)
Text Muted:     #a8aaa1 (gray)
Lines/Borders:  rgba(238,238,231,.22) (subtle ivory)
Accent:         #e5d6b9 (gold)
```

### Service Dialog Colors
```
Background:     #171b15 (dark green-black)
Border:         #5c6650 (olive green)
Input BG:       #10170d (darker)
Input Border:   #48553b (muted green)
Focus:          #b7c99b (light green)
Success:        #b7d4a8 (light green)
Warning:        #ddbca9 (peach)
```

### Status Badge Colors
```
Pending:        #d5dabc on #687453 border
Rejected:       #ddbca9 on #795c4c border
Accepted:       #b7d4a8 on #5d7754 border
Completed:      #b7d4a8 on #5d7754 border
```

## Responsive Breakpoints

```
Mobile:     < 650px
  • Single column layouts
  • Stack navigation
  • Full-width dialogs
  • Simplified grids

Tablet:     650px - 1000px
  • 2-column grids
  • Compact navigation
  • Medium dialogs

Desktop:    > 1000px
  • Multi-column grids
  • Full navigation
  • Optimal spacing

Wide:       > 1800px
  • Increased spacing
  • Larger typography
  • Enhanced controls
```

## Typography Scale

```
Display Large:  174px (Headline on desktop)
Display Small:  86px (Headline secondary)
Title H1:       52px (Service dialog heading)
Title H2:       38px (Mobile heading)
Body Large:     16-20px (Section headings)
Body Regular:   12-13px (Main content)
Body Small:     10-11px (Labels, meta)
Tiny:           8-9px (Eyebrow, tags)
```

---

**Reference for developers and designers**
**Last updated**: September 12, 2026
