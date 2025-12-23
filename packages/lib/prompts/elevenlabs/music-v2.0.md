---
version: "2.0"
description: "Improved ElevenLabs prompt with clearer structure and chat-based extraction"
createdAt: "2025-01-09"
author: "Sunday School Music Creator Team"
features:
  - "Clearer musical style specification"
  - "Bible verse spoken word-for-word"
  - "Explicit musical elements"
  - "Character limit for lyrics"
  - "Chat-based placeholder extraction"
---

# Base Template

Create a children's Sunday School song for ages {{ageGroup|5-10}}. {{#bibleReference}}Bible verse (spoken word-for-word): "{{bibleReference}}"{{/bibleReference}}Style: Simple, singable children's worship music{{#mood}}, {{mood}} tone{{/mood}}{{#energy}}, {{energy}} energy{{/energy}}{{#instrumental}}, instrumental only{{/instrumental}}{{#theme}}Theme: {{theme}}{{/theme}}{{#lyrics}}Lyrics (max 1500 chars):{{lyrics}}{{/lyrics}}Musical elements: Piano, acoustic guitar, light percussion. Melodic, easy-to-remember tune with repetitive chorus. Tempo suitable for young children to sing along.

# Mood Mappings

- happy: joyful, uplifting
- peaceful: calm, gentle
- excited: enthusiastic, celebratory
- reflective: thoughtful, contemplative
- worship: reverent, worshipful

# Energy Mappings

- high: upbeat, energetic
- medium: moderate tempo
- low: slow, gentle
- calm: peaceful, relaxing

# Truncation Priority

When the prompt exceeds 2000 characters, preserve in this order:
1. Base structure (always keep)
2. Musical elements description (always keep)
3. Bible verse (if provided)
4. Theme
5. Style descriptors (mood/energy)
6. Lyrics (truncate to fit within 1500 chars)