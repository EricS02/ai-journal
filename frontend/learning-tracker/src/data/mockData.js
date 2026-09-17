/**
 * Mock data. Single-user, local, no backend.
 *
 * Goal:      { id, title, created_at, subtasks: Subtask[] }
 * Subtask:   { id, description, weight: 1-5 }   // progress is DERIVED, never stored
 * LogEntry:  { id, goal_id, date, text, evidence: [{ subtask_id, confidence, delta, reason }] }
 * Concept:   { name, first_seen, related: string[], mention_count }
 *
 * Checkpoint fill is always the sum of the deltas of the entries that cited it,
 * so every number on screen traces back to an entry. Do not persist fills.
 */
export const TODAY = '2026-09-03';

export const GOALS = [
    { id: 'g1', title: 'Read and write idiomatic Rust', created_at: '2026-04-12', subtasks: [
      { id: 's1', description: "Explain ownership, borrowing and lifetimes without reaching for the docs", weight: 5 },
      { id: 's2', description: "Read an unfamiliar crate's source and follow its trait bounds", weight: 4 },
      { id: 's3', description: "Write code that compiles without arguing with the borrow checker", weight: 4 },
      { id: 's4', description: "Design an API around traits and generics instead of one enum of everything", weight: 3 },
      { id: 's5', description: "Handle errors with Result, ? and a custom error type", weight: 3 },
      { id: 's6', description: "Use async/await and say what Send + 'static is actually demanding", weight: 4 },
      { id: 's7', description: "Profile an allocation-heavy hot path and make it faster", weight: 2 },
      { id: 's8', description: "Publish a small crate with tests and rustdoc", weight: 2 }
    ] },
    { id: 'g2', title: 'Implement a transformer from scratch, attention through sampling', created_at: '2026-08-24', subtasks: [
      { id: 't1', description: "Derive scaled dot-product attention on paper and say why the √d scaling is there", weight: 4 },
      { id: 't2', description: "Implement multi-head attention that matches a reference implementation numerically", weight: 5 },
      { id: 't3', description: "Explain what residual placement and layernorm do to gradient flow", weight: 3 },
      { id: 't4', description: "Train a small model on a toy corpus and read the loss curve", weight: 4 },
      { id: 't5', description: "Implement top-k and nucleus sampling and describe how each fails", weight: 2 }
    ] }];

export const LOG_ENTRIES = [
    { id: 'l1', goal_id: 'g1', date: '2026-04-14', text: "Worked through the ownership chapter and rewrote the examples from memory afterwards. Moves still surprise me when a value goes into a function and I try to use it again, but I can now predict which of the two lines will fail before compiling.", evidence: [
      { subtask_id: 's1', confidence: 0.4, delta: 0.08, reason: "Predicting which line fails before compiling is the ownership model being applied, not recited." },
      { subtask_id: 's3', confidence: 0.25, delta: 0.04, reason: "Errors were anticipated rather than discovered, which is the early form of not fighting the checker." }
    ] },
    { id: 'l2', goal_id: 'g1', date: '2026-04-21', text: "Rewrote the log parser to hold &str slices into the original buffer instead of cloning every field. Two hours of borrow checker errors about the buffer being dropped before the parsed struct. Fixed it by tying the struct to the buffer's lifetime with an explicit parameter.", evidence: [
      { subtask_id: 's3', confidence: 0.5, delta: 0.1, reason: "The fix was a structural change to the design, not a clone inserted to silence the error." },
      { subtask_id: 's1', confidence: 0.3, delta: 0.05, reason: "Introducing an explicit lifetime parameter to bind a struct to a buffer is direct use of the borrowing rules." }
    ] },
    { id: 'l3', goal_id: 'g1', date: '2026-05-03', text: "Read serde's derive output for a nested struct and followed Deserialize through the Visitor trait. Got lost at DeserializeSeed and stopped there, but I could name every bound on the way down.", evidence: [
      { subtask_id: 's2', confidence: 0.55, delta: 0.12, reason: "Following a real crate's generated code through a trait hierarchy, and naming the bounds, is the checkpoint's exact behaviour." },
      { subtask_id: 's4', confidence: 0.3, delta: 0.05, reason: "Reading a trait-and-visitor design closely is evidence of understanding the pattern, not yet of designing with it." }
    ] },
    { id: 'l4', goal_id: 'g1', date: '2026-05-19', text: "Replaced the anyhow catch-all in the ingest binary with a thiserror enum. Five variants, each wrapping the underlying io or parse error, and ? now carries them up through three layers without a single map_err.", evidence: [
      { subtask_id: 's5', confidence: 0.7, delta: 0.2, reason: "A typed error enum with From conversions and no map_err noise is the idiomatic shape this checkpoint measures." },
      { subtask_id: 's3', confidence: 0.2, delta: 0.03, reason: "The refactor touched three layers and compiled without borrow-related rework." }
    ] },
    { id: 'l5', goal_id: 'g1', date: '2026-06-02', text: "Spent twenty minutes at the whiteboard explaining to Priya why her function signature needed two lifetimes rather than one, and why the returned reference could only borrow from the first argument. No docs open.", evidence: [
      { subtask_id: 's1', confidence: 0.8, delta: 0.18, reason: "Teaching lifetime elision from memory, correctly, is the strongest available evidence for this checkpoint." }
    ] },
    { id: 'l6', goal_id: 'g1', date: '2026-06-27', text: "Started the tokio experiment. Spawned a task holding a reference to config and hit the Send + 'static bound head-on. Read it as: the runtime may move this task to another thread at any time and cannot know when the borrow ends. Wrapped config in an Arc.", evidence: [
      { subtask_id: 's6', confidence: 0.35, delta: 0.12, reason: "The entry restates what the bound demands in terms of thread movement and borrow duration, which is the explanation half of the checkpoint." },
      { subtask_id: 's5', confidence: 0.2, delta: 0.03, reason: "Task errors were propagated as Result rather than unwrapped." }
    ] },
    { id: 'l7', goal_id: 'g1', date: '2026-07-08', text: "Rewrote the exporter as a trait with two implementations instead of an enum with a match in six places. Generic over the writer, so the tests use an in-memory buffer. Adding a third format now touches one file.", evidence: [
      { subtask_id: 's4', confidence: 0.45, delta: 0.12, reason: "Replacing a match-on-enum with a trait plus a generic writer is the design decision this checkpoint is about." },
      { subtask_id: 's2', confidence: 0.2, delta: 0.04, reason: "The generic writer bound was copied from std's Write, which required reading how std states it." }
    ] },
    { id: 'l8', goal_id: 'g1', date: '2026-07-25', text: "Read tokio's park/unpark path in the current-thread scheduler to work out where my task was actually sleeping. Followed it as far as the driver. Still unclear how the timer wheel hands control back.", evidence: [
      { subtask_id: 's2', confidence: 0.4, delta: 0.09, reason: "Navigating scheduler internals unaided, and knowing where comprehension stopped, is reading source rather than skimming it." },
      { subtask_id: 's6', confidence: 0.25, delta: 0.06, reason: "The question being asked — where a task sleeps — is about the runtime model, not the syntax." }
    ] },
    { id: 'l9', goal_id: 'g1', date: '2026-08-11', text: "Flamegraphed the JSON hot path. 40% of the time was in allocations from the per-record Vec of field names. Switched to SmallVec with an inline capacity of 8 and reused a scratch buffer between records. Throughput 1.9x.", evidence: [
      { subtask_id: 's7', confidence: 0.3, delta: 0.1, reason: "A profiler identified the cost, the fix targeted allocation specifically, and the result was measured." },
      { subtask_id: 's3', confidence: 0.3, delta: 0.05, reason: "Reusing a scratch buffer across iterations required getting the borrows right on the first attempt." }
    ] },
    { id: 'l10', goal_id: 'g1', date: '2026-08-30', text: "Wrote an axum extractor for the tenant header. Hit the usual lifetime error on the request parts, saw immediately that I was borrowing from something the handler didn't own, and fixed it by taking ownership of the header value. Ten minutes, no searching.", evidence: [
      { subtask_id: 's1', confidence: 0.5, delta: 0.09, reason: "The diagnosis was made from the error text alone and named the actual cause." },
      { subtask_id: 's3', confidence: 0.45, delta: 0.08, reason: "Ten minutes with no external reference is a marked change from the two hours in the April entry." },
      { subtask_id: 's6', confidence: 0.2, delta: 0.04, reason: "The extractor is an async trait implementation, so the bounds had to be satisfied deliberately." }
    ] },
    { id: 'l11', goal_id: 'g2', date: '2026-08-24', text: "Read the attention paper properly for the first time and implemented scaled dot-product attention in numpy against a 4-token toy sequence. Checked the softmax rows sum to one. The √d term I can state but not yet justify.", evidence: [
      { subtask_id: 't1', confidence: 0.3, delta: 0.06, reason: "The mechanism was implemented and sanity-checked; the scaling term was explicitly stated as not yet understood, which caps the confidence." }
    ] }];

export const CONCEPTS = [
    { name: 'Ownership', first_seen: '2026-04-14', related: ['Move semantics', 'Borrowing'], mention_count: 14 },
    { name: 'Move semantics', first_seen: '2026-04-14', related: ['Ownership', 'Copy trait'], mention_count: 6 },
    { name: 'Borrowing', first_seen: '2026-04-21', related: ['Lifetimes', 'Ownership'], mention_count: 11 },
    { name: 'Lifetimes', first_seen: '2026-04-21', related: ['Lifetime elision', 'Borrowing'], mention_count: 12 },
    { name: 'Lifetime elision', first_seen: '2026-06-02', related: ['Lifetimes'], mention_count: 3 },
    { name: 'Trait bounds', first_seen: '2026-05-03', related: ['Generics', 'Monomorphisation'], mention_count: 9 },
    { name: 'Visitor pattern', first_seen: '2026-05-03', related: ['Serde', 'Trait bounds'], mention_count: 2 },
    { name: 'Serde', first_seen: '2026-05-03', related: ['Visitor pattern', 'Derive macros'], mention_count: 5 },
    { name: 'Derive macros', first_seen: '2026-05-03', related: ['Serde'], mention_count: 4 },
    { name: 'Error enums', first_seen: '2026-05-19', related: ['thiserror', 'Result'], mention_count: 7 },
    { name: 'thiserror', first_seen: '2026-05-19', related: ['Error enums', 'anyhow'], mention_count: 3 },
    { name: 'anyhow', first_seen: '2026-05-19', related: ['thiserror'], mention_count: 2 },
    { name: 'Result', first_seen: '2026-04-14', related: ['Error enums', 'Question mark operator'], mention_count: 10 },
    { name: 'Question mark operator', first_seen: '2026-05-19', related: ['Result', 'From conversions'], mention_count: 4 },
    { name: 'From conversions', first_seen: '2026-05-19', related: ['Error enums'], mention_count: 3 },
    { name: 'Send + Sync', first_seen: '2026-06-27', related: ['Arc', 'Tokio'], mention_count: 8 },
    { name: 'Arc', first_seen: '2026-06-27', related: ['Send + Sync', 'Interior mutability'], mention_count: 5 },
    { name: 'Tokio', first_seen: '2026-06-27', related: ['Send + Sync', 'Scheduler park/unpark'], mention_count: 9 },
    { name: 'Scheduler park/unpark', first_seen: '2026-07-25', related: ['Tokio'], mention_count: 2 },
    { name: 'Generics', first_seen: '2026-07-08', related: ['Trait bounds', 'Monomorphisation'], mention_count: 6 },
    { name: 'Monomorphisation', first_seen: '2026-07-08', related: ['Generics'], mention_count: 2 },
    { name: 'SmallVec', first_seen: '2026-08-11', related: ['Allocation', 'Flamegraph'], mention_count: 2 },
    { name: 'Flamegraph', first_seen: '2026-08-11', related: ['Allocation'], mention_count: 3 },
    { name: 'Allocation', first_seen: '2026-08-11', related: ['SmallVec', 'Flamegraph'], mention_count: 5 },
    { name: 'Axum extractors', first_seen: '2026-08-30', related: ['Tokio', 'Trait bounds'], mention_count: 2 },
    { name: 'Scaled dot-product attention', first_seen: '2026-08-24', related: ['Softmax', 'Multi-head attention'], mention_count: 3 },
    { name: 'Softmax', first_seen: '2026-08-24', related: ['Scaled dot-product attention'], mention_count: 2 },
    { name: 'Multi-head attention', first_seen: '2026-08-24', related: ['Scaled dot-product attention'], mention_count: 1 }];
