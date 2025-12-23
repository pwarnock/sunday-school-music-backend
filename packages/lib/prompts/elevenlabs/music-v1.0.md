---
version: "1.0"
description: "Initial ElevenLabs music generation prompt for Sunday School songs"
createdAt: "2025-01-09"
author: "Sunday School Music Creator Team"
features:
  - "Age-appropriate content for children 5-10"
  - "Christian educational context"
  - "Mood and energy mapping"
  - "Bible verse integration"
  - "Instrumental support"
  - "Dynamic lyrics inclusion"
---

# Base Template

Create a Sunday School song for children aged {{ageGroup|5-10}}{{#theme}}, with the theme: "{{theme}}"{{/theme}} {{#bibleReference}}, based on the Bible verse: {{bibleReference}}{{/bibleReference}} {{#mood}}, with a {{mood}} feeling{{/mood}} {{#energy}}, that is {{energy}}{{/energy}} {{#instrumental}}, as an instrumental piece suitable for singing along{{/instrumental}}{{^instrumental}}, with vocals included{{/instrumental}} {{#lyrics}}{{^instrumental}}, Lyrics: "{{lyrics}}"{{/instrumental}}{{/lyrics}}, Make it simple, engaging, and appropriate for young children in a Christian educational setting

# Mood Mappings

- happy: joyful and uplifting
- peaceful: calm and peaceful
- excited: enthusiastic and celebratory
- reflective: gentle and thoughtful
- worship: reverent and worshipful

# Energy Mappings

- high: energetic and fun
- medium: moderately paced
- low: gentle and soothing
- calm: peaceful and relaxing

# Truncation Priority

When the prompt exceeds 2000 characters, preserve in this order:
1. Base context (always keep)
2. Age-appropriate guidance (always keep)
3. Theme
4. Bible reference
5. Mood and energy
6. Instrumental preference
7. Lyrics (truncate at verse boundaries if possible)