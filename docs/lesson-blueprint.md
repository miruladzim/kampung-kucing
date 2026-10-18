# Lesson blueprint for Kampung Kucing Misi Jejak Sejarah

This blueprint describes a functional prototype for Form 2 Sejarah revision. It is a lesson design, not a claim that the lesson has been conducted or that student engagement has improved. The classroom incident for the assignment must come from a real observation or teacher interview. The lecturer should confirm whether a custom-developed game is acceptable as the selected tool in Question 1; the brief does not explicitly settle this.

## Lesson overview

- Subject and level: Sejarah, Tingkatan 2, secondary school.
- Topic: Chapter 2.2, Kegiatan Ekonomi Masyarakat Kerajaan Alam Melayu.
- Curriculum alignment: SP 5.2.2, describing the economic activities of societies in the Alam Melayu kingdoms.
- Duration: 40 minutes.
- Proposed context: mixed-attainment Form 2 learners revising a previously taught topic. School type, class size, device availability and the real incident still need to be supplied by the student author.
- Tool selected for the proposed lesson: Kampung Kucing Misi Jejak Sejarah, compared with Kahoot! in Question 1.
- Strategy: self-paced exploration and mastery missions with private formative feedback, hints, retries and four completion fish. There is no countdown, speed bonus, elimination or public ranking.
- Public prototype: https://miruladzim.github.io/kampung-kucing/
- Direct activity mode without 3D controls: https://miruladzim.github.io/kampung-kucing/?mode=ringan

## Intended classroom problem

The design addresses low participation and passive task completion during Sejarah revision. The working explanation is that repetitive questioning and worksheets may offer limited choice, contextual visual support and immediate feedback. This is a design hypothesis; do not describe invented classroom behaviours or a fictional teacher interview as observed evidence.

## Measurable objectives

By the end of the lesson, learners should be able to:

1. Name the four groups of economic activities: agriculture; trade; collection of forest and marine products; and mining and manufacturing. Assess this in the written exit reflection and oral discussion.
2. Correctly classify at least eight of the twelve individual examples across the three sorting activities on the first submission. The report provides item-level first-attempt totals as well as whole-question correctness.
3. Explain two factors supporting economic activities, using examples from the mission materials. The teacher evaluates this explanation in the exit reflection; the prototype does not automatically grade written reasoning.

## Lesson sequence

| Minutes | Teacher actions | Learner actions | Evidence and feedback |
| --- | --- | --- | --- |
| 0–5 | Show a commodity or harbour illustration. Ask how goods are produced and traded. Collect initial ideas without public ranking. | Share an idea individually or with a partner. | Note initial confusion between collecting, producing and trading. This is a discussion baseline, not a measured improvement claim. |
| 5–8 | Demonstrate one control, the mission book, hints, audio and the results button. Explain that retries do not erase first answers. Offer direct activity mode to anyone who needs it. | Enter an optional alias; choose a station. In a pair, agree who controls first and rotate after each activity. | Check that every learner can access a task. A single pair report represents joint work, not separate individual attainment. |
| 8–24 | Facilitate the four stations, approximately four minutes each. Watch reasoning and ask learners why they chose a category. Keep brief discussions focused. | Complete 12 activities in a chosen station order: single-choice, two-answer reasoning and sorting. Read or listen to prompts; inspect diagrams; use hints and retry. | Feedback appears after each submission. The session retains first answers, hint use, attempts and completion. Four fish reward station completion, not demonstrated independent mastery. |
| 24–30 | Ask learners to open Laporan and download CSV. Collect files through the school's approved submission method. For an immediate check, inspect results on a learner's device. | Save the report before leaving or changing users. Identify a concept they corrected after a retry. | Read first-attempt correctness, hint-before-first-response and sorting-item totals. Do not use the final 12/12 completion count as the initial achievement score. |
| 30–36 | Group the reports by concept. If sorting forest/sea products is weak, show four fresh picture cards and ask learners to justify their source. If harbour reasoning is weak, redraw the two-direction route and ask why the meeting point helps traders. | Discuss a misconception, reclassify a new example and explain the reasoning. | Recheck with one fresh oral or paper example. The report's per-concept teacher suggestions support this action. The prototype does not aggregate a class or deliver reports automatically. |
| 36–40 | Ask learners to name the four groups and explain two factors in the exit reflection. Review one explanation with the class and collect a final CSV including the reflection. | Write the exit reflection in Laporan, save the updated CSV, and share a takeaway. | Teacher assesses the written explanation and checks it against the objectives. If time is short, collect an individual paper exit ticket, especially after paired work. |

## Prototype structure

1. Pertanian: irrigation function; sorting crops and collected goods; selecting actions relevant to interrupted irrigation.
2. Perdagangan: interpreting a schematic trading meeting point; selecting harbour facilities; connecting agricultural surplus to trade.
3. Hasil Hutan dan Laut: sorting sources; matching rattan to its use; distinguishing collecting goods from trading them.
4. Perlombongan dan Pembuatan: sorting activities; explaining transformation into goods; recognising links among economic activities.

There are twelve question cards: six single-choice tasks, three two-answer tasks, and three sorting tasks with four examples each. The 3D village is a fictional learning hub. The diagrams are original conceptual illustrations, not reconstructions of a named ancient kingdom, a real archaeological site, or an actual historical route.

## Feedback and assessment data

Wrong answers receive a targeted conceptual prompt and another opportunity. Correct answers receive an explanation. Hints are recorded separately, including whether one was used before the first answer. Completed activities can be reviewed without changing their original attempt records. A station earns exactly one fish after all three tasks have been solved.

CSV contains one row for each question, including unanswered questions. Fields include alias, station, concept, first and latest answers, first-attempt correctness, hint-before-first-response, number of attempts, sorting-item totals, follow-up guidance, timestamp and the learner's exit reflection. Data is stored in the current browser. There is no login, central teacher dashboard, automatic sharing or cross-device synchronisation. On a shared device, export the completed report before selecting Sesi baharu.

First attempts are made after the learner has access to the revision visuals and notes. They are formative revision evidence, not a pre-test of unaided prior knowledge. A hint-supported answer is not reported as an independent correct first answer.

## Learning theory connection

The cognitive theory of multimedia learning informs the use of relevant diagrams alongside concise verbal prompts (Mayer, 2009). Irrigation arrows and a schematic harbour support the specific question being answered. A smaller task sequence, optional narration and a paused village during activities are design choices intended to keep attention on the historical reasoning. This is a theory-informed design rationale, not proof that this prototype improves learning. Peer explanation and teacher questioning remain necessary to examine the reasoning behind clicks.

## Development reflection and evidence

A specific design hurdle was that control of a 3D cat could become a barrier to demonstrating historical understanding. The implemented response was to: (1) separate the question bank and assessment state from the village renderer; (2) allow every station to open from a mission book; (3) add activity mode without 3D controls and use it if WebGL is unavailable; and (4) test that the same answer records and progress are used in both modes. A second issue was that retries could disguise initial misconceptions; retaining first attempts and assisted status prevents the completion reward from replacing diagnostic evidence.

Development screenshots show genuine stages of this prototype. Later assessment screenshots contain prototype QA responses, not observations or results from school students.

- Stage 1: original exploration village, before learning integration — evidence/01-village-before-learning.jpg.
- Stage 2: learning station book and visual assets — evidence/02-learning-stations.jpg.
- Stage 3: interactive question and feedback verification — evidence/03-question-feedback.jpg.
- Stage 4: assessment report and follow-up verification — evidence/04-assessment-report.jpg.

## Rationale and practical limits

The missions connect a broad topic to visible tasks, offer learner choice, and provide response-specific feedback that a worksheet checked after class cannot provide immediately. However, a visually attractive village alone is not evidence of learning or reduced boredom. The teacher must inspect responses, ask for explanations and adapt instruction. Test the prototype on school devices and use direct activity mode when 3D performance or navigation is a barrier. Speech output depends on browser support and available voices; diagrams and complete text remain accessible without audio.

## Sources and APA reference

Content resources verified during development:

- Buku Teks Sejarah Tingkatan 2, printed pages 28–33, official copy hosted by Jabatan Muzium Malaysia: https://ipim.jmm.gov.my/sites/default/files/file1p1m/Buku%20Teks%20Sejarah%20Tingkatan%202.pdf
- Perincian DSKP dan Buku Teks Sejarah Tingkatan 2, page 2: https://ipim.jmm.gov.my/sites/default/files/dockokurikulum/T2_DSKP%20VS%20BUKU%20TEKS_ZAR.pdf

Verified learning-theory reference:

Mayer, R. E. (2009). *Multimedia learning* (2nd ed.). Cambridge University Press. https://doi.org/10.1017/CBO9780511811678

This lesson blueprint is not the final 2,500–3,000-word assignment report. The tool comparison, authentic classroom incident, lecturer's acceptance of a custom tool, complete reference list and forum evidence remain separate assignment work.

## Prototype verification

The automated test suite checks twelve assessment questions, first-attempt preservation, hint tracking, sorting-item totals, idempotent rewards, saved-state restoration and CSV escaping, alongside village-life, cat-motion and pond tests. A browser walkthrough completed all twelve activities using the visible controls and deliberately answered one first question incorrectly. The resulting report retained 11 correct first attempts, one retry, twelve completed activities and four fish. The actual browser-downloaded CSV was parsed and checked for twelve records, the preserved error and the exit reflection. The non-3D mode restored the same completed session. These are prototype QA checks, not an evaluation with learners.
