# Feature Specification: Veritas Inversa (Aletheia) Website

**Feature Branch**: `001-build-a-sophisticated`  
**Created**: 2025-09-07  
**Status**: Draft  
**Input**: User description: "Build a sophisticated website for the Veritas Inversa brand (Aletheia platform) - a decentralized narrative market on Bittensor. The website should embody a minimalist, clinical, data-centric aesthetic similar to financial trading terminals. Features include: narrative marketplace dashboard, narrative foundry for creating NFTs, validator/miner interfaces, real-time metrics visualization, semantic landscape analysis tools, and staking/underwriting functionality. The brand positioning emphasizes strategic information markets over technical implementation."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a sophisticated capital provider (hedge fund, political campaign, corporate entity, or researcher) interested in narrative markets, I want to access a professional platform where I can underwrite, monitor, and manage strategic narratives through economic incentives, similar to how I would interact with a financial trading platform.

### Acceptance Scenarios

1. **Given** a new narrative underwriter visits the platform, **When** they view the marketplace dashboard, **Then** they see a real-time overview of all active narratives with staking metrics, recent activity, and semantic clustering
2. **Given** an underwriter wants to create a new narrative demand signal, **When** they use the narrative foundry, **Then** they can mint a new Narrative-NFT with proper metadata and see its semantic position relative to existing narratives
3. **Given** a validator needs to monitor network health, **When** they access their dashboard, **Then** they see consensus alignment, reputation scores, and oracle operational costs
4. **Given** a miner wants to prioritize high-value tasks, **When** they view their dashboard, **Then** they see a ranked list of heavily staked narratives with potential rewards
5. **Given** a user is analyzing narrative competition, **When** they use the semantic landscape tool, **Then** they can visualize narrative clusters and identify dilution risks
6. **Given** an underwriter has staked on a narrative, **When** they return to monitor it, **Then** they see time-series staking data, fulfillment activity, and successful dissemination proofs

### Edge Cases
- What happens when multiple users attempt to mint semantically identical narratives?
- How does the system handle network connectivity issues during real-time metric updates?
- What occurs when a user attempts to stake more $NARR than they possess?
- How does the platform display narratives with zero stake?
- What happens when dissemination proofs fail verification?

## Requirements *(mandatory)*

### Functional Requirements

**Narrative Marketplace**
- **FR-001**: System MUST display all existing Narrative-NFTs in a searchable, filterable dashboard
- **FR-002**: System MUST show real-time metrics for each narrative including total $NARR staked, unique underwriters count, and staking activity history
- **FR-003**: System MUST provide time-series visualization of staking activity for each narrative
- **FR-004**: System MUST display recent fulfillment activity showing content that passed validation tiers
- **FR-005**: System MUST showcase successful dissemination proofs with links to placement locations
- **FR-006**: System MUST allow sorting and filtering narratives by stake amount, activity, modality, and tags
- **FR-007**: System MUST update marketplace data in [NEEDS CLARIFICATION: real-time update frequency - every second, minute, or on-demand?]

**Narrative Foundry**
- **FR-008**: System MUST provide guided workflow for creating new Narrative-NFTs
- **FR-009**: System MUST generate semantic embeddings from narrative descriptions in real-time
- **FR-010**: System MUST visualize semantic position of new narratives relative to existing ones
- **FR-011**: System MUST validate narrative metadata before minting
- **FR-012**: System MUST calculate and display minting fees
- **FR-013**: System MUST prevent duplicate narrative submissions based on [NEEDS CLARIFICATION: exact match or semantic similarity threshold?]

**Semantic Landscape Analysis**
- **FR-014**: System MUST provide interactive visualization of narrative semantic space
- **FR-015**: System MUST identify and highlight narrative clusters
- **FR-016**: System MUST calculate semantic similarity between narratives
- **FR-017**: System MUST allow users to identify potential semantic dilution attacks
- **FR-018**: System MUST enable exploration of semantic competition zones

**Staking/Underwriting**
- **FR-019**: System MUST allow users to stake $NARR tokens on specific narratives
- **FR-020**: System MUST display current stake amounts and potential returns
- **FR-021**: System MUST enforce minimum lock-up periods for staked tokens
- **FR-022**: System MUST allow unstaking after lock-up period expires
- **FR-023**: System MUST calculate and display staking fees
- **FR-024**: System MUST show user's staking portfolio and performance

**Validator Dashboard**
- **FR-025**: System MUST display network health metrics and overall subnet activity
- **FR-026**: System MUST show validator's consensus alignment and reputation score
- **FR-027**: System MUST track dissemination oracle operational costs
- **FR-028**: System MUST provide performance analytics for validation activities
- **FR-029**: System MUST alert validators to [NEEDS CLARIFICATION: what types of critical events - consensus deviations, oracle failures?]

**Miner Dashboard**
- **FR-030**: System MUST display "bounty board" of heavily staked narratives
- **FR-031**: System MUST rank narratives by potential reward value
- **FR-032**: System MUST provide interface for submitting dissemination proofs
- **FR-033**: System MUST track verification status of submitted proofs
- **FR-034**: System MUST display earned rewards and payment history
- **FR-035**: System MUST show performance metrics for generation and dissemination

**Visual Design & Branding**
- **FR-036**: System MUST implement minimalist, clinical aesthetic similar to financial terminals
- **FR-037**: System MUST use data-centric visualizations and professional color palette
- **FR-038**: System MUST replace casual terminology with strategic/financial language
- **FR-039**: System MUST maintain consistent "Aletheia" branding throughout

**Performance & Reliability**
- **FR-040**: System MUST handle [NEEDS CLARIFICATION: expected concurrent user load - 100, 1000, 10000?]
- **FR-041**: System MUST maintain [NEEDS CLARIFICATION: uptime requirement - 99.9%, 99.99%?]
- **FR-042**: System MUST load dashboard views within [NEEDS CLARIFICATION: performance target - 2 seconds, 5 seconds?]

**Security & Access**
- **FR-043**: System MUST authenticate users via [NEEDS CLARIFICATION: wallet connection, email/password, OAuth?]
- **FR-044**: System MUST secure all financial transactions and token operations
- **FR-045**: System MUST protect against [NEEDS CLARIFICATION: specific security threats - XSS, CSRF, smart contract exploits?]

### Key Entities

- **Narrative-NFT**: Represents a stakeable narrative concept with metadata including name, description, tags, modality, and semantic embedding
- **Staker/Underwriter**: Capital provider who signals demand for narratives by staking $NARR tokens
- **Validator**: Network participant who scores miner outputs and operates dissemination oracles
- **Miner**: Participant who generates content and disseminates it to public platforms
- **$NARR Token**: Native token used for staking on narratives
- **TAO Token**: Bittensor network token that can be exchanged for $NARR
- **Dissemination Proof**: Evidence of successful content placement on public websites
- **Semantic Embedding**: High-dimensional vector representing narrative meaning
- **Staking Position**: User's locked tokens on specific narratives with lock-up period
- **Reputation Score**: Validator's trustworthiness metric based on consensus alignment

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (contains clarification needs)

---

## Notes

This specification captures the core functionality for a sophisticated decentralized narrative market platform. The platform reframes content generation as "narrative underwriting" and positions itself as a strategic tool for information markets rather than a simple content creation service.

Key areas requiring clarification before implementation:
- Real-time update frequencies and performance requirements
- User authentication and security model
- Specific thresholds for duplicate detection
- Expected scale and concurrent user load
- Uptime and reliability requirements

The platform's success depends on creating a professional, data-driven experience that appeals to sophisticated market participants while abstracting the underlying technical complexity of the Bittensor network.