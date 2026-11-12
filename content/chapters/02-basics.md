---
id: basics
num: 2
title: What these tools actually do
summary: Prediction, not knowledge. What today's tools can do with your assignments.
minutes: 6
track: beginner
---
## Prediction, not knowledge

A chatbot like [[ChatGPT]] or [[Copilot]] runs on a [[large language model]], a kind of [[generative AI]]. Stripped down, it's a very large autocomplete: trained on huge amounts of text (its [[training data]]) to predict which words, or [[tokens|token]], come next, then tuned to follow instructions and be helpful.

Three things follow from that, and they explain most of what surprises people:

- **It sounds right whether or not it is right.** Fluency comes from the prediction, not from checking facts. When it's wrong, it's wrong in the same confident tone. That's called [[hallucination]].
- **It doesn't look things up, unless the tool adds a search step.** Many tools now search the web or your files first, which helps, but the model still writes the answer and can still misread the source. See [[RAG|rag]].
- **It answers the question you asked, not the one you meant.** How you phrase the [[prompt]] changes the answer a lot. That's also why two students with the same tool get very different results.

:::beginner Is it "intelligent"?
That's a debate we don't need to settle. For teaching, what matters is what it can do (a lot), and how reliable it is (less than it sounds). Treat it like the policy says: a knowledgeable, fast, overconfident colleague who isn't accountable for anything.
:::

===

## What a hallucination looks like

An illustration, shortened. A user asks a chatbot for sources:

> **User:** Give me three peer-reviewed references on regime shifts in Baltic Sea fisheries, with DOIs.
>
> **Chatbot:** Here are three key references:
> 1. Möllmann, C. et al. (2009). Reorganization of a large marine ecosystem due to atmospheric and anthropogenic pressure: a discontinuous regime shift in the Central Baltic Sea. *Global Change Biology*, 15(6).
> 2. Berg, K. & Halvorsen, T. (2017). Cascading tipping points in Baltic cod governance. *Ecology and Society*, 22(3). doi:10.5751/ES-12345-220399
> 3. ...

The first one is a real paper. **The second is invented for this illustration**, and that's the point: it has plausible authors in the right field, a fitting journal, a DOI in the right format. Free chatbots without web search still do this. Paid versions and [[agentic|ai-agent]] tools that search and check their own output do it much less, so this happens less and less, but not never.

:::tip What this means for you
A reference list is no longer proof that someone read the sources. The quick check: paste a submission's reference list (only the list, no name) into a chatbot with web search and ask it to look up each reference and flag any it can't find. Then look up the flagged ones yourself; the chatbot can be wrong in both directions. Chapter 8 says why this is fine under the rules.

It won't catch everyone. Students with paid or agentic tools rarely hand in invented references. Asking students to quote the page they relied on catches unread sources too. A fabricated reference is a problem whatever its cause.
:::

===
<!-- slide: wide -->
## What can AI do with your assignments?

As of November 2026. Make a guess for each, then flip the card.

<div data-widget="flipcards"><script type="application/json">
[
{"tag":"Seminar text","front":"Write a 600-word reflection on this week's readings, relating them to your own field.","back":"**Yes, easily**, if the student pastes in the readings or they're well known. Generic without them, but generic often passes. Personal and local details can be invented convincingly."},
{"tag":"Online quiz","front":"Answer a 20-question multiple-choice quiz in the course room.","back":"**Yes.** A student can paste questions in, or an {{AI agent}} can open the quiz in a browser and click through it on its own. Treat unsupervised online quizzes as practice, not evidence."},
{"tag":"Data analysis","front":"Analyse a dataset in R and interpret the results.","back":"**Mostly, yes.** Code is one of the things these tools do best. The interpretation will be plausible; mistakes are subtle (wrong test, misread variable). A short oral check finds out fast whether the student understands it."},
{"tag":"Literature review","front":"Write a literature review on a topic, with 25 references.","back":"**Yes, with caveats.** {{Deep-research tools|deep-research}} search, read and write a report with real links in minutes. Coverage can be thin or skewed, and some sources may be misrepresented. Checking takes the student real work, if they do it."},
{"tag":"Oral exam","front":"Explain and defend your argument to the examiner for 15 minutes.","back":"**No.** AI can help a student *prepare*, which is fine and often good. It can't sit the conversation for them."},
{"tag":"In-class writing","front":"Write a short argument by hand in the seminar room, no devices.","back":"**No.** Which is why moving a small, important part of an assessment into the room is one of the most effective changes you can make."},
{"tag":"Field visit report","front":"Report what you observed on our visit to the coastal fishing community, and connect it to the literature.","back":"**Partly.** AI can't have been there, but it can write a convincing report of a visit that sounds like this one. Ask for specifics only attendees would know, or discuss it in the seminar."},
{"tag":"Images","front":"Interpret this figure from the lecture and explain what it shows about ocean acidification.","back":"**Yes.** Current tools read images, charts and handwriting. Visual material is no longer AI-proof."}
]
</script></div>

===

## Where these tools are still weak

For now, and less every year:

- **Being right when it matters.** Confident errors, made-up details, misread sources.
- **What happened in your course.** Your seminar discussion, your guest lecturer's argument, what students saw on a field visit.
- **Recent and local knowledge.** Events after the [[training cutoff]], unless the tool searches; Swedish or regional detail.
- **Judgement under questioning.** A student who used AI to skip the thinking can't defend the result.

:::grey Don't build your teaching on this list
Every item here is shrinking. Use it to understand today's tools, not to design assessments that rely on AI being bad at something. The safer assumption is that AI will be able to do the take-home part.
:::

This slide is updated as tools change. Last reviewed: November 2026.
