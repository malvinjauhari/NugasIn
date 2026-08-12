# AI AGENT CONTEXT

## Academic Document Builder

You are the lead software engineer responsible for designing and implementing **Academic Document Builder**, a Windows desktop application for students to create structured academic documents with automated formatting.

The application focuses on **document structure, formatting, templating, preview, editing, validation, and DOCX generation**. It does NOT generate academic content.

---

# 1. PRODUCT CONCEPT

The core workflow is:

`Choose Template → Fill Metadata → Configure → Generate → Live Preview → Optional Advanced Editing → Validate → Export DOCX`

The user creates the content themselves. The application handles repetitive document formatting and structural work.

The primary output is a **native, editable Microsoft Word `.docx` file**.

The preview is only a visual/editor representation. The exported DOCX is the final authority.

---

# 2. INITIAL DOCUMENT TYPES

The MVP supports three primary document templates:

1. **Laporan Praktikum (Laprak)**
2. **Makalah Akademik / MKDU**
3. **Logbook Tugas Besar**

The template system MUST be extensible.

Template-specific formatting must not be hardcoded throughout the application.

---

# 3. TEMPLATE: LAPORAN PRAKTIKUM

## 3.1 General Page Formatting

* Paper: A4
* Size: 21 × 29.7 cm
* Orientation: Portrait
* Left margin: 4 cm
* Top margin: 3 cm
* Right margin: 3 cm
* Bottom margin: 3 cm

## 3.2 Body Text

* Font: Times New Roman
* Size: 12 pt
* Line spacing: 1.5
* Alignment: Justify
* First-line paragraph indentation: 1.27 cm where required
* Paragraph spacing should be controlled consistently through styles.

## 3.3 Chapter Heading

Example:

`BAB I PENDAHULUAN`

Rules:

* Times New Roman
* 14 pt
* Bold
* Center
* Uppercase
* Must behave as a real Heading/structural element, not merely styled text.

## 3.4 Sub-heading

Example:

`1.1 Tujuan Praktikum`

Rules:

* Times New Roman
* 12 pt
* Bold
* Left aligned
* Must use structural heading levels and numbering rather than manually typed numbers.

## 3.5 Cover

The cover should support:

* Telkom University logo
* Logo approximately 5 × 5 cm
* Module/title
* Student name
* NIM
* Class
* Practical Assistant / Asprak code
* Study Program
* Faculty
* University
* Year

The exact visual positioning must be template-driven.

## 3.6 Recommended Structure

```text
Cover
│
├── BAB I PENDAHULUAN
│   ├── 1.1 Tujuan Praktikum
│   └── 1.2 Alat dan Bahan
│
├── BAB II DASAR TEORI
│
├── BAB III HASIL PRAKTIKUM DAN PEMBAHASAN
│   ├── 3.1 Source Code
│   ├── 3.2 Screenshot Output
│   └── 3.3 Analisis dan Pembahasan
│
├── BAB IV KESIMPULAN
│
└── Daftar Pustaka
```

## 3.7 Special Rules

Source code may be represented as screenshots or formatted code depending on the specific assignment rules.

Screenshots may need to show the IDE, file path, terminal, or other proof of execution.

References should support theoretical material.

Website references may be allowed depending on assignment rules.

The application should NOT assume that every Laprak has exactly the same rules. Template-specific configuration must allow variations.

---

# 4. TEMPLATE: MAKALAH AKADEMIK / MKDU

## 4.1 General Page Formatting

* Paper: A4
* Orientation: Portrait
* Left margin: 4 cm
* Top margin: 3 cm
* Right margin: 3 cm
* Bottom margin: 3 cm

## 4.2 Body Text

* Font: Times New Roman
* Size: 12 pt
* Line spacing: 1.5
* Alignment: Justify

Daftar Isi and Daftar Pustaka may use single spacing depending on the selected template rules.

## 4.3 Page Numbering

Front matter:

* Roman numerals
* Example: i, ii, iii
* Center-bottom positioning

Main content:

* Arabic numerals
* Example: 1, 2, 3

First page of a chapter may use:

* centered bottom page number

Subsequent pages may use:

* top-right or bottom-right positioning

This behavior must be implemented through Word sections/header/footer/page-number mechanisms rather than manually inserting page-number text.

## 4.4 Cover

Support:

* Title
* Logo
* Lecturer
* "Disusun Oleh"
* Name
* NIM
* Study Program
* Faculty
* Institution
* Year

Typical title:

* 14 pt
* Bold
* Center
* Uppercase where required

## 4.5 Recommended Structure

```text
Cover
│
├── Kata Pengantar
│
├── Daftar Isi
│
├── Daftar Gambar
│
├── Daftar Tabel
│
├── BAB I PENDAHULUAN
│   ├── 1.1 Latar Belakang
│   ├── 1.2 Rumusan Masalah
│   └── 1.3 Tujuan Penulisan
│
├── BAB II PEMBAHASAN
│   ├── 2.1 Kajian Teori
│   └── 2.2 Analisis Masalah
│
├── BAB III PENUTUP
│   ├── 3.1 Kesimpulan
│   └── 3.2 Saran
│
└── Daftar Pustaka
```

The exact chapter structure must remain configurable because lecturers may require different structures.

## 4.6 Academic References

The application may provide fields and structural support for:

* IEEE citations
* APA citations
* bibliography/reference entries

However, the application must NOT fabricate academic references.

The reference system should be designed so it can later integrate with reference-management workflows.

Typical assignment requirements may include:

* journal articles
* books
* official institutional/government websites
* recent sources

Specific year limits and plagiarism thresholds are assignment-dependent and MUST NOT be treated as universal rules.

---

# 5. TEMPLATE: LOGBOOK TUGAS BESAR

## 5.1 Page Formatting

Default:

* Paper: A4
* Orientation: Landscape preferred

The template may support Portrait when necessary.

## 5.2 Margins

Possible defaults:

* Normal: approximately 3 cm
* Narrow: approximately 1.27 cm

The selected template configuration determines the final value.

## 5.3 Typography

Recommended:

* Arial 10 pt OR
* Times New Roman 11 pt

Table text:

* Single spacing
* Before spacing: 0 pt
* After spacing: 0 pt

## 5.4 Header Metadata

Support:

* Mata Kuliah
* Judul Tugas Besar
* Kelompok
* Kelas
* Nama anggota
* NIM anggota

## 5.5 Main Table

Columns:

```text
No.
Hari, Tanggal
Aktivitas / Progres Pengerjaan
Anggota yang Hadir / Terlibat
Kendala
Solusi
Paraf Pembimbing / Asprak
```

The table must be a **real editable DOCX table**.

It must not be simulated using positioned text.

## 5.6 Logbook Rules

* Contribution of each member should be visible.
* Each progress entry may require supervisor approval/signature.
* No academic citation is normally required.
* Table width must remain within printable page boundaries.
* Landscape orientation should be used when needed to prevent column overflow.

---

# 6. TEMPLATE ENGINE

Templates must be data/configuration-driven.

Conceptually:

```text
templates/
│
├── laprak/
│   ├── template
│   ├── structure
│   └── formatting-rules
│
├── makalah/
│   ├── template
│   ├── structure
│   └── formatting-rules
│
└── logbook/
    ├── template
    ├── structure
    └── formatting-rules
```

A template should define:

* page settings
* styles
* heading hierarchy
* numbering
* sections
* headers
* footers
* page numbers
* default structure
* required metadata
* allowed elements
* table definitions
* image rules

Adding a new template should NOT require rewriting the document engine.

---

# 7. DOCUMENT MODEL

Use a structured document model.

Conceptually:

```text
Document
│
├── Metadata
├── Page Settings
├── Sections
├── Styles
├── Numbering
├── Headers
├── Footers
└── Content
    ├── Paragraph
    ├── Heading
    ├── Image
    ├── Table
    ├── List
    ├── Page Break
    └── Other Elements
```

Do NOT use coordinates such as:

```text
x = 120
y = 240
```

as the primary representation of document structure.

Academic documents are semantic and structural, not canvas graphics.

---

# 8. WORD COMPATIBILITY

Microsoft Word is the final authority.

Whenever possible, use native Word concepts:

* styles
* heading levels
* numbering definitions
* sections
* real page numbers
* real tables
* headers/footers
* captions
* page breaks

Avoid simulating Word behavior with plain text.

For example:

BAD:

`"1.1 Tujuan Praktikum"` as an ordinary paragraph.

GOOD:

```text
Heading
level = 2
title = "Tujuan Praktikum"
numbering = automatic
```

BAD:

`"1"` manually typed in a footer.

GOOD:

Native Word page-number field.

---

# 9. PREVIEW

The UI contains a live document preview/editor.

The preview should represent:

* page size
* margins
* typography
* headings
* spacing
* images
* tables
* page breaks
* page numbering

The preview does NOT need to be pixel-identical to Microsoft Word.

The important requirement is:

> The exported DOCX must behave correctly when opened in Microsoft Word.

Preview and DOCX export MUST use the same Document Model.

---

# 10. ADVANCED FORMATTING

Advanced formatting is optional.

Possible controls:

### Page

* paper size
* orientation
* margins
* page numbering
* header/footer

### Typography

* font
* size
* weight
* alignment

### Paragraph

* line spacing
* before/after spacing
* first-line indentation
* indentation

### Heading

* heading level
* style
* numbering

### Tables

* width
* alignment
* borders
* cell formatting

### Images

* width
* height
* alignment
* caption

Changes should preferably modify styles or structural rules globally rather than manually modifying every element.

---

# 11. ERROR PREVENTION

The system must actively prevent or detect:

* inconsistent formatting
* broken numbering
* incorrect heading hierarchy
* wrong page numbers
* unexpected page breaks
* empty pages
* table overflow
* image overflow
* distorted images
* missing assets
* invalid metadata
* preview/export differences
* formatting drift in DOCX
* Word compatibility problems

Validation levels:

```text
ERROR
WARNING
INFO
```

---

# 12. ARCHITECTURAL RULES

Use:

```text
Document Model
      │
      ├──→ Preview Renderer
      │
      └──→ DOCX Generator
```

Not:

```text
UI → Preview DOM → DOCX
```

The UI is not the source of truth.

Keep these concerns separated:

* UI
* document domain model
* templates
* formatting rules
* validation
* preview
* DOCX generation
* file/export services

Avoid:

* spaghetti code
* duplicated formatting logic
* template-specific logic inside UI components
* hardcoded coordinates
* tightly coupled UI and DOCX generation
* unnecessary abstractions
* premature features

---

# 13. MVP

The MVP must allow:

1. Select document type.
2. Select template.
3. Enter metadata.
4. Upload logo/assets.
5. Generate document.
6. Preview document.
7. Edit document.
8. Adjust advanced formatting optionally.
9. Validate.
10. Export `.docx`.
11. Open the result in Microsoft Word.
12. Continue editing normally in Word.

The MVP does NOT need:

* AI essay generation
* plagiarism checking
* Turnitin integration
* cloud collaboration
* mobile apps
* full Microsoft Word feature parity
* advanced research/citation automation

---

# 14. DESIGN DIRECTION

The UI must be:

**Minimalist, elegant, clean, lightweight, modern, professional, and document-focused.**

Use:

* generous whitespace
* restrained colors
* modern sans-serif UI typography
* subtle borders
* subtle animation
* clear hierarchy
* simple controls

Avoid:

* excessive gradients
* excessive cards
* visual clutter
* unnecessary animations
* dashboard-style complexity

The interface should feel like a focused productivity tool rather than a second Microsoft Word.

---

# 15. ENGINEERING PRIORITY

When making technical decisions, prioritize in this order:

```text
1. DOCX correctness
2. Document structure
3. Data consistency
4. Template flexibility
5. Validation
6. Maintainability
7. Preview quality
8. UI polish
```

Do not sacrifice document correctness for visual effects.

Do not introduce a feature merely because it is technically possible.

The central product promise is:

> **Choose a template, fill in the required information, and get a clean, structured, editable, Word-compatible academic document with minimal manual formatting.**

When a specific TTD, PRD, template specification, lecturer instruction, or university formatting guideline is provided later, treat that document as the **higher-priority source of truth for that specific template** and adapt the implementation accordingly.

