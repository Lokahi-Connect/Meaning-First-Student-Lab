# Meaning-First Student Lab

A structured word inquiry learning environment built on Meaning-First Literacy principles.

This application supports students in investigating how English orthography preserves meaning through morphology.

---

## Purpose

The Meaning-First Student Lab is a student-facing investigation tool designed to:

* Prioritize meaning before sound
* Identify bases before analyzing suffixes
* Develop morphological awareness
* Reduce cognitive load through tiered scaffolds
* Support neurodivergent learners through structured inquiry

This lab operationalizes the instructional sequence:

**Meaning → Structure → Related Words → Grapheme Function**

---

## Instructional Alignment

This project aligns with:

* Structured Word Inquiry (SWI)
* Integrative Neurodevelopmental Theory (INT)
* Mediated Learning principles
* Strengths-based neurodiversity frameworks

English spelling is treated as a meaning-preserving system.
Pronunciation may shift.
Structure remains stable.

---

## How the Learning Lab Works

Each lesson includes:

1. **Meaning**

   * Word in sentence context
   * Student interpretation

2. **Structure**

   * Base identification
   * Suffix analysis
   * Stability of spelling

3. **Related Words**

   * Word family investigation
   * Morphological connections

4. **Grapheme Function**

   * Explanation of how the suffix functions
   * Non-binding grapheme language

---

## Tier System

The app includes four instructional tiers:

* 🌱 Emerging
* 🌿 Developing
* 🌳 Expanding
* 🔬 Abstract

Each tier adjusts scaffolding intensity while maintaining conceptual order.

---

## Adding a Lesson

Lessons are stored in:

```
src/data/lessons.ts
```

Each lesson requires:

* id
* word
* sentence
* base
* suffix
* structure
* related words array
* grapheme explanation

To expand the lab:

1. Add additional lesson objects to the `LESSONS` array.
2. Maintain increasing morphological complexity.
3. Preserve the instructional sequence constraint.

---

## Development

Built with:

* React
* TypeScript
* Vite

Run locally:

```
npm install
npm run dev
```

---

## Long-Term Vision

This Student Lab will evolve into:

* A data-driven curriculum engine
* An adaptive tier-switching system
* A morphology-powered literacy research tool
* A scalable instructional platform for Meaning-First Literacy

---

Lokahi Connect
Advancing equitable literacy through structure, meaning, and cognitive clarity.
